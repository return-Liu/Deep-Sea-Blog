// auth.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { createSixNum, verifyEmail } = require("../utils/email");
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../utils/errors");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
// 生成一个随机的特征码
function generateFeatureCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
// 生成一个随机的昵称
function generateNickname() {
  const adjectives = [
    "快乐",
    "阳光",
    "梦想",
    "未来",
    "星辰",
    "微笑",
    "旅行",
    "自由",
  ];
  const nouns = [
    "小猫",
    "小狗",
    "飞鸟",
    "大海",
    "山川",
    "星空",
    "花园",
    "风筝",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective}${randomNoun}`; // 组合生成四位昵称
}
// 随机生成一个密码
function generatePassword() {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let uuid = "";
  for (let i = 0; i < 16; i++) {
    uuid += chars[Math.floor(Math.random() * chars.length)];
  }
  return uuid;
}
// 生成一个 UUID
function generateUUID() {
  const length = 10; // 你可以根据需要修改位数
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += randomBytes[i] % 10; // 只取 0-9 的数字
  }
  return result;
}

// 用于存储二维码状态，生产建议用 Redis
const qrcodeStore = {};

// 1. 生成二维码（前端请求）
router.post("/qrcode", async (req, res) => {
  // 生成唯一二维码ID
  const qrcodeId = generateUUID();
  // 存储二维码状态，未登录
  qrcodeStore[qrcodeId] = {
    status: "pending",
    userId: null,
    expire: Date.now() + 2 * 60 * 1000,
  }; // 2分钟有效
  success(res, "二维码生成成功", { qrcodeId });
});
// 生成二维码图片
router.get("/image/:qrcodeId", async (req, res) => {
  const { qrcodeId } = req.params;
  try {
    // 这里二维码内容就是qrcodeId，你也可以自定义内容
    const qrData = qrcodeId;
    res.setHeader("Content-Type", "image/png");
    QRCode.toFileStream(res, qrData, { width: 180 });
  } catch (err) {
    failure(res, err);
  }
});
// 2. 轮询二维码状态（前端定时请求）
router.get("/qrcode/status/:qrcodeId", async (req, res) => {
  const { qrcodeId } = req.params;
  const record = qrcodeStore[qrcodeId];
  if (!record || record.expire < Date.now()) {
    return failure(res, new BadRequestError("二维码已失效"));
  }
  if (record.status === "scanned") {
    // 生成token
    const user = await User.findByPk(record.userId);
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    // 清理二维码
    delete qrcodeStore[qrcodeId];
    return success(res, "扫码成功", { token });
  }
  success(res, "等待扫码", { status: record.status });
});

// 3. 手机端扫码后确认（扫码后跳转到此接口，带上qrcodeId和用户token）
router.post("/qrcode/scan", async (req, res) => {
  const { qrcodeId, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded.userId;
    const record = qrcodeStore[qrcodeId];
    if (!record || record.expire < Date.now()) {
      return failure(res, new BadRequestError("二维码已失效"));
    }
    // 标记为已扫码
    qrcodeStore[qrcodeId] = { ...record, status: "scanned", userId };
    success(res, "扫码成功");
  } catch (err) {
    failure(res, new UnauthorizedError("无效token"));
  }
});
// 切换账号
router.post("/switch-account", async (req, res) => {
  try {
    const { userId } = req.body; // 需要切换到的用户ID

    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("用户不存在");
    }

    // 生成新的JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    // 返回新的Token
    success(res, "切换账号成功", { token });
  } catch (error) {
    failure(res, error);
  }
});
// 获取当前用户
async function getCurrentUser(req) {
  const token = req.headers.authorization?.split(" ")[1]; // 从请求头中获取 token
  if (!token) {
    throw new UnauthorizedError("未提供身份验证令牌");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET); // 使用 secret 验证 token
    const user = await User.findByPk(decoded.userId); // 根据解码后的 userId 查询用户
    if (!user) {
      throw new UnauthorizedError("用户不存在");
    }
    return user; // 返回当前用户对象
  } catch (err) {
    throw new UnauthorizedError("无效的身份验证令牌");
  }
}
/**
 * 获取当前用户绑定的所有账号
 */
router.get("/accounts", async (req, res) => {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser(req);

    // 查询与当前用户 特征码 相同的所有账号
    const users = await User.findAll({
      where: {
        clientFeatureCode: currentUser.clientFeatureCode,
      },
      // 过滤敏感字段
      attributes: {
        exclude: ["password", "code", "codeExpire", "createdAt", "updatedAt"],
      },
    });

    // 返回结果
    success(res, "获取账号列表成功", users);
  } catch (error) {
    // 错误处理
    console.error("获取账号列表失败:", error);
    failure(res, error);
  }
});
/**
 * 用户登录
 * POST auth/sign_in
 */
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login) {
      throw new BadRequestError("账号或手机号或邮箱必须填写!");
    }
    if (!password) {
      throw new BadRequestError("密码必须填写!");
    }
    const condition = {
      where: {
        [Op.or]: [{ email: login }, { username: login }, { phone: login }],
      },
    };
    const user = await User.findOne(condition);
    if (!user) throw new NotFoundError("用户不存在, 请先注册账号!");
    // 验证密码是否正确
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!login) {
      throw new BadRequestError("请输入正确的账号或手机号或邮箱");
    }
    if (!isPasswordValid)
      throw new UnauthorizedError("密码错误,请输入正确的密码");
    // 生成身份验证令牌
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      // 设置令牌过期时间 1小时
      expiresIn: "1h",
    });
    success(res, "登录成功", {
      token,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 邮箱验证码登录 - 发送验证码
router.post("/email/verify", async (req, res) => {
  try {
    const { email, clientFeatureCode } = req.body;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        password: generatePassword(),
        nickname: generateNickname(),
        sex: 0,
        uuid: generateUUID(),
        clientFeatureCode: clientFeatureCode || generateFeatureCode(),
        username: `${generateUUID()}`,
        avatar: null,
        birthday: null,
        introduce: "",
        constellation: null,
        area: null,
        nicknameColor: "#000000",
        phone: null,
      });
    }

    const code = createSixNum();
    await user.update({
      code,
      codeExpire: new Date(Date.now() + 5 * 60 * 1000),
    });

    await verifyEmail(email, code);

    success(res, "验证码已发送，请查收您的邮箱");
  } catch (error) {
    failure(res, error);
  }
});
// 邮箱验证码登录 - 验证验证码并登录
router.post("/email", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError("用户不存在");

    if (user.code !== code) throw new Error("验证码错误");
    if (new Date() > user.codeExpire) throw new Error("验证码已过期");

    // 生成身份验证令牌
    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    success(res, "登录成功", {
      token,
    });
  } catch (error) {
    failure(res, error);
  }
});
module.exports = router;
