const express = require("express");
const router = express.Router();
const { User, Device } = require("../models");
const { success, failure } = require("../utils/responses");
const { createSixNum, verifyEmail } = require("../utils/email");
const { canSendCode } = require("../utils/rateLimiter");
const { extractDeviceInfo } = require("../utils/deviceInfo");
const cron = require("node-cron");
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
const axios = require("axios");
// 生成设备唯一标识符
function generateDeviceId(userId, userAgent) {
  const hash = crypto.createHash("md5");
  hash.update(`${userId}-${userAgent}`);
  return hash.digest("hex");
}
// 生成一个随机的特征码
function generateFeatureCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
// 生成一个随机的昵称
function generateNickname() {
  const adjectives = [
    "星尘",
    "极光",
    "深海",
    "云端",
    "迷雾",
    "幻影",
    "星轨",
    "流光",
    "梦境",
    "暗夜",
    "星河",
    "风语",
    "晨曦",
    "暮光",
    "荒原",
    "孤岛",
    "星火",
    "月影",
  ];
  const nouns = [
    "旅者",
    "诗人",
    "观测者",
    "旅人",
    "画师",
    "歌者",
    "守望者",
    "拾光者",
    "漫游者",
    "造梦师",
    "引路者",
    "夜行者",
    "追光者",
    "拾忆者",
    "星语者",
    "光之子",
    "风之灵",
    "海之子",
    "梦之翼",
  ];
  const modifiers = [
    "·",
    "_",
    "°",
    "·",
    "の",
    "·",
    "·",
    "°",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
  ];
  const suffixes = [
    "Ⅰ",
    "Ⅱ",
    "Ⅲ",
    "X",
    "Z",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
    "·",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomModifier =
    modifiers[Math.floor(Math.random() * modifiers.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // 90% 概率加修饰符
  const hasModifier = Math.random() > 0.1;

  // 30% 概率加后缀
  const hasSuffix = Math.random() > 0.7;

  let nickname =
    randomAdjective + (hasModifier ? randomModifier : "") + randomNoun;
  if (hasSuffix) {
    nickname += randomSuffix;
  }

  return nickname;
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

// 获取ip地址
async function getIpAddress() {
  try {
    const response = await axios.get(
      "https://apis.map.qq.com/ws/location/v1/ip",
      {
        params: {
          key: "B3QBZ-57BWV-3MIPO-5QBY6-ZPUCS-F7BUJ",
          ip: "223.104.174.0",
        },
        timeout: 3000, // 3秒超时
      }
    );

    const result = response.data?.result;
    if (!result) {
      console.error("Invalid API response:", response.data);
      return { city: "未知", province: "未知" };
    }

    const { city = "未知", province = "未知" } = result.ad_info || {};
    return { city, province };
  } catch (error) {
    console.error("获取位置信息失败:", error.message);
    return { city: "未知", province: "未知" };
  }
}
// 获取ip经纬度
async function getIPLocation(ip) {}
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
async function handlePostLogin(user, req, res, loginMethod) {
  // 生成token
  const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
    expiresIn: "1h",
  });

  // 记录设备信息
  const deviceInfo = await extractDeviceInfo(req);
  const deviceId = generateDeviceId(user.id, deviceInfo.userAgent);

  // 获取位置信息
  const locationInfo = await getIpAddress();

  // 查找或创建设备记录
  let device = await Device.findOne({ where: { deviceId } });

  // 计算登录过期时间（1小时后）
  const loginExpire = new Date(Date.now() + 60 * 60 * 1000);

  const deviceData = {
    userId: user.id,
    deviceId,
    deviceName: deviceInfo.deviceName,
    deviceType: deviceInfo.deviceType,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    lastLoginTime: new Date(),
    isTrusted: false,
    userAgent: deviceInfo.userAgent,
    location: locationInfo.city,
    province: locationInfo.province,
    city: locationInfo.city,
    loginMethod: loginMethod,
    status: "已登录",
    loginExpire: loginExpire, // 添加过期时间
  };

  if (!device) {
    device = await Device.create(deviceData);
  } else {
    await device.update({
      lastLoginTime: new Date(),
      deviceName: deviceInfo.deviceName,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      location: deviceData.location,
      province: deviceData.province,
      city: deviceData.city,
      loginMethod: loginMethod || device.loginMethod,
      status: "已登录",
      loginExpire: loginExpire, // 更新过期时间
    });
  }

  success(res, "登录成功", {
    token,
    deviceInfo: {
      deviceName: deviceInfo.deviceName,
      isTrusted: device.isTrusted,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      location: deviceData.location,
      province: deviceData.province,
      city: deviceData.city,
    },
  });
}

/**
 * 用户登录
 * POST auth/sign_in
 */
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login) throw new BadRequestError("账号或手机号或邮箱必须填写!");
    if (!password) throw new BadRequestError("密码必须填写!");

    let condition = { where: {} };
    let loginMethod = "未知登录方式";

    // 根据输入类型构建查询条件并确定登录方式
    if (/^1[3-9]\d{9}$/.test(login)) {
      // 手机号登录
      condition.where.phone = login;
      loginMethod = "手机号登录";
    } else if (login.includes("@")) {
      // 邮箱登录
      condition.where.email = login;
      loginMethod = "邮箱登录";
    } else {
      // 用户名登录
      condition.where.username = login;
      loginMethod = "账号登录";
    }

    const user = await User.findOne(condition);
    if (!user) throw new NotFoundError("用户不存在, 请先注册账号!");

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedError("密码错误,请输入正确的密码");
    await handlePostLogin(user, req, res, loginMethod);
  } catch (error) {
    failure(res, error);
  }
});

router.post("/email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError("用户不存在");
    if (user.code !== code) throw new BadRequestError("验证码错误");
    if (new Date() > user.codeExpire) throw new BadRequestError("验证码已过期");

    await handlePostLogin(user, req, res, "邮箱登录");
  } catch (error) {
    failure(res, error);
  }
});
// 邮箱验证码登录 - 发送验证码（带频率限制）
router.post("/email/verify", async (req, res) => {
  try {
    const { email, clientFeatureCode } = req.body;

    const key = `email:${email}`;
    if (!canSendCode(key)) {
      throw new BadRequestError("请求频繁，请明天再试");
    }

    if (clientFeatureCode) {
      const featureKey = `feature:${clientFeatureCode}`;
      if (!canSendCode(featureKey)) {
        throw new BadRequestError("请求频繁，请明天再试");
      }
    }

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
        phone: "",
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

// 登录设备管理
router.post("/login/device", async (req, res) => {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser(req);

    // 提取设备信息
    const deviceInfo = await extractDeviceInfo(req);
    const deviceId = generateDeviceId(currentUser.id, deviceInfo.userAgent);

    // 查找或创建设备记录
    let device = await Device.findOne({
      where: {
        deviceId: deviceId,
      },
    });

    // 确保所有必需字段都有默认值
    const deviceData = {
      userId: currentUser.id,
      deviceId: deviceId,
      deviceName: deviceInfo.deviceName || deviceInfo.deviceType || "未知设备",
      deviceType: deviceInfo.deviceType || "unknown",
      os: deviceInfo.os || "unknown",
      browser: deviceInfo.browser || "unknown",
      lastLoginTime: new Date(),
      userAgent: deviceInfo.userAgent,
      location: deviceInfo.location || "未知位置",
      province: deviceInfo.province || "未知省",
    };

    if (!device) {
      // 创建设备记录前确保所有必需字段都已设置
      device = await Device.create(deviceData);
    } else {
      // 更新最后登录时间
      await device.update({
        lastLoginTime: new Date(),
      });
    }

    success(res, "设备信息记录成功", {
      deviceId: device.deviceId,
      isTrusted: device.isTrusted,
    });
  } catch (error) {
    console.error("设备记录失败:", error);
    failure(res, error);
  }
});
// 获取用户所有登录设备
// 修改 /devices 路由
router.get("/devices", async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const currentDeviceInfo = await extractDeviceInfo(req);
    const currentDeviceId = generateDeviceId(
      currentUser.id,
      currentDeviceInfo.userAgent
    );

    const devices = await Device.findAll({
      where: { userId: currentUser.id },
      order: [["lastLoginTime", "DESC"]],
    });

    // 检查设备是否过期并更新状态
    const now = new Date();
    const updatedDevices = await Promise.all(
      devices.map(async (device) => {
        // 如果设备状态为已登录但已过期，则更新为未登录
        if (
          device.status === "已登录" &&
          device.loginExpire &&
          device.loginExpire < now
        ) {
          await device.update({ status: "未登录" });
          device.status = "未登录"; // 更新内存中的状态
        }
        return device;
      })
    );

    const formattedDevices = updatedDevices.map((device) => ({
      id: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      lastLoginTime: device.lastLoginTime,
      location: device.location,
      city: device.city,
      province: device.province,
      isCurrentDevice: device.deviceId === currentDeviceId,
      loginMethod: device.loginMethod || "未知登录方式",
      status: device.status,
    }));

    success(res, "获取设备列表成功", formattedDevices);
  } catch (error) {
    failure(res, error);
  }
});

// 删除设备（登出设备）
router.delete("/devices/:deviceId", async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const { deviceId } = req.params;

    // 检查设备是否属于当前用户
    const device = await Device.findOne({
      where: {
        deviceId: deviceId,
        userId: currentUser.id,
      },
    });

    if (!device) {
      throw new NotFoundError("设备不存在或不属于当前用户");
    }

    // 不允许删除当前设备
    const currentDeviceInfo = extractDeviceInfo(req);
    const currentDeviceId = generateDeviceId(
      currentUser.id,
      currentDeviceInfo.userAgent
    );

    if (device.deviceId === currentDeviceId) {
      // 将当前设备状态设为未登录而不是删除
      await device.update({ status: "未登录" });
      return success(res, "设备已登出");
    }

    await device.destroy();

    success(res, "设备删除成功");
  } catch (error) {
    failure(res, error);
  }
});
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // 查找所有已登录但过期的设备
    const expiredDevices = await Device.findAll({
      where: {
        status: "已登录",
        loginExpire: {
          [Op.lt]: now, // 小于当前时间
        },
      },
    });

    // 更新这些设备的状态为"未登录"
    for (const device of expiredDevices) {
      await device.update({ status: "未登录" });
    }

    if (expiredDevices.length > 0) {
      console.log(
        `[${new Date().toISOString()}] 已将 ${
          expiredDevices.length
        } 个设备状态更新为未登录`
      );
    }
  } catch (error) {
    console.error("定时任务更新设备状态失败:", error);
  }
});
module.exports = router;
