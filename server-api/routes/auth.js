const express = require("express");
const router = express.Router();
const { User, Device } = require("../models");
const { success, failure } = require("../utils/responses");
const {
  createSixNum,
  verifyEmailForRegister,
  verifyEmailForLogin,
} = require("../utils/email"); // 修改这里
const { canSendCode } = require("../utils/rateLimiter");
const { extractDeviceInfo } = require("../utils/deviceInfo");
const userAuth = require("../middlewares/user-auth");
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../utils/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
  const randomNumbers = Math.floor(10000000 + Math.random() * 90000000);
  return `Deep Sea-${randomNumbers}`;
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
router.get("/accounts", userAuth, async (req, res) => {
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
// 登录方式
async function handlePostLogin(
  user,
  req,
  res,
  loginMethod,
  successMessage = "登录成功"
) {
  // 检查用户是否被冻结
  if (user.isFrozen === 1) {
    return success(res, "账户已被冻结", {
      isFrozen: true,
      frozenReason: user.frozenReason || "违反社区规定",
      frozenAt: user.frozenAt,
      userId: user.id,
      message: user.frozenMessage || "您的账户已被冻结，如有疑问请联系客服。",
      unfreezeAt: user.unfreezeAt,
      freezeType: user.freezeType,
      frozenMessage: user.frozenMessage,
    });
  }

  // 生成token
  const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
    expiresIn: "1h",
  });

  // 获取设备信息
  const deviceId = req.body.deviceId;
  const userAgent = req.get("User-Agent") || "";

  // 记录设备登录信息
  if (deviceId) {
    await Device.upsert(
      {
        deviceId,
        userId: user.id,
        userAgent,
        lastActiveAt: new Date(),
        lastLoginTime: new Date(), // 记录最后登录时间
        status: "已登录",
        loginMethod: loginMethod,
        loginExpire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        where: { deviceId },
      }
    );
  } else {
    // 如果没有提供deviceId，则从User-Agent生成设备ID并记录完整设备信息
    const deviceInfo = await extractDeviceInfo(req);
    const generatedDeviceId = generateDeviceId(user.id, deviceInfo.userAgent);

    // 查找或创建设备记录
    let device = await Device.findOne({
      where: {
        deviceId: generatedDeviceId,
      },
    });

    // 确保所有必需字段都有默认值
    const deviceData = {
      userId: user.id,
      deviceId: generatedDeviceId,
      deviceName: deviceInfo.deviceName || deviceInfo.deviceType || "未知设备",
      deviceType: deviceInfo.deviceType || "unknown",
      os: deviceInfo.os || "unknown",
      loginExpire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7天后过期
      browser: deviceInfo.browser || "unknown",
      lastLoginTime: new Date(),
      userAgent: deviceInfo.userAgent,
      status: "已登录",
      loginMethod: loginMethod,
      lastActiveAt: new Date(),
    };

    if (!device) {
      // 创建设备记录前确保所有必需字段都已设置
      device = await Device.create(deviceData);
    } else {
      // 更新设备信息
      await device.update(deviceData);
    }
  }

  // 更新用户最后登录时间
  await user.update({
    lastLoginAt: new Date(),
  });

  success(res, successMessage, {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isFrozen: user.isFrozen,
    },
  });
}
// 切换账号
router.post("/switch-account", userAuth, async (req, res) => {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser(req);
    // 获取目标用户ID
    const { userId } = req.body;
    // 验证参数
    if (!userId) {
      throw new BadRequestError("目标用户ID不能为空");
    }
    // 检查是否是同一个账号
    if (currentUser.id === parseInt(userId)) {
      throw new BadRequestError("你已经在该账号下登录啦~");
    }
    // 查找目标用户
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      throw new NotFoundError("目标用户不存在");
    }
    // 验证目标用户是否与当前用户具有相同的特征码（属于同一用户组）
    if (targetUser.clientFeatureCode !== currentUser.clientFeatureCode) {
      throw new UnauthorizedError("无权限切换到该账号");
    }

    // 检查目标用户是否被冻结
    if (targetUser.isFrozen === 1) {
      return success(res, "账户已被冻结", {
        isFrozen: true,
        frozenReason: targetUser.frozenReason || "违反社区规定",
        frozenAt: targetUser.frozenAt,
        username: targetUser.username,
        unfreezeAt: targetUser.unfreezeAt,
        freezeType: targetUser.freezeType,
        frozenMessage:
          targetUser.frozenMessage || "您的账户已被冻结，如有疑问请联系客服。",
        userId: targetUser.id,
      });
    }

    // 执行登录处理逻辑，传递"切换账号"作为登录方式和特定成功消息
    await handlePostLogin(targetUser, req, res, "切换账号", "账号切换成功");
  } catch (error) {
    failure(res, error);
  }
});
/**
 * 用户登录
 */
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login) throw new BadRequestError("账号或手机号或邮箱必须填写!");
    if (!password) throw new BadRequestError("密码必须填写!");

    let condition = { where: {} };

    // 根据输入类型构建查询条件
    if (/^1[3-9]\d{9}$/.test(login)) {
      condition.where.phone = login;
    } else if (login.includes("@")) {
      condition.where.email = login;
    } else {
      condition.where.username = login;
    }

    const user = await User.findOne(condition);
    if (!user) throw new NotFoundError("用户不存在, 请先注册账号!");

    // 检查用户是否被冻结（在验证密码之前）
    if (user.isFrozen === 1) {
      // 返回冻结状态信息，而不是直接拒绝登录
      return success(res, "账户已被冻结", {
        isFrozen: true,
        frozenReason: user.frozenReason || "违反社区规定",
        frozenAt: user.frozenAt,
        username: user.username,
        unfreezeAt: user.unfreezeAt,
        freezeType: user.freezeType,
        frozenMessage: user.frozenMessage,
      });
    }

    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedError("密码错误,请输入正确的密码");

    // 登录成功
    await handlePostLogin(user, req, res, "密码登录");
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
      throw new BadRequestError("请求频繁，请稍后再试");
    }

    if (clientFeatureCode) {
      const featureKey = `feature:${clientFeatureCode}`;
      if (!canSendCode(featureKey)) {
        throw new BadRequestError("请求频繁，请稍后再试");
      }
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });
    const code = createSixNum();

    // 发送对应的邮件
    if (!user) {
      await verifyEmailForRegister(email, code);
      // 创建临时用户记录
      await User.create({
        email,
        code,
        codeExpire: new Date(Date.now() + 5 * 60 * 1000),
        uuid: require("crypto").randomUUID(), // 生成随机UUID
        password: Math.random().toString(36).slice(-8), // 生成临时密码
        sex: 0, // 设置默认性别
        clientFeatureCode: clientFeatureCode || "unknown", // 使用传入的特征码或默认值
        theme: "light", // 添加必需的主题字段
        role: "user", // 添加必需的角色字段
      });
    } else {
      await verifyEmailForLogin(email, code);
      await user.update({
        code,
        codeExpire: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    success(res, "验证码发送成功");
  } catch (error) {
    failure(res, error);
  }
}); // 邮箱验证码登录 - 发送验证码（带频率限制）
router.post("/email/verify", async (req, res) => {
  try {
    const { email, clientFeatureCode } = req.body;

    const key = `email:${email}`;
    if (!canSendCode(key)) {
      throw new BadRequestError("请求频繁，请稍后再试");
    }

    if (clientFeatureCode) {
      const featureKey = `feature:${clientFeatureCode}`;
      if (!canSendCode(featureKey)) {
        throw new BadRequestError("请求频繁，请稍后再试");
      }
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });
    const code = createSixNum();

    // 发送对应的邮件
    if (!user) {
      await verifyEmailForRegister(email, code);
      // 创建临时用户记录
      await User.create({
        email,
        code,
        codeExpire: new Date(Date.now() + 5 * 60 * 1000),
        uuid: require("crypto").randomUUID(), // 生成随机UUID
        password: Math.random().toString(36).slice(-8), // 生成临时密码
        sex: 0, // 设置默认性别
        clientFeatureCode: clientFeatureCode || "unknown", // 使用传入的特征码或默认值
        theme: "light", // 添加必需的主题字段
        role: "user", // 添加必需的角色字段
      });
    } else {
      await verifyEmailForLogin(email, code);
      await user.update({
        code,
        codeExpire: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    success(res, "验证码发送成功");
  } catch (error) {
    failure(res, error);
  }
});

// 邮箱验证码登录
router.post("/email", async (req, res) => {
  try {
    const { email, code, clientFeatureCode } = req.body;

    // 查找用户
    let user = await User.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError("用户不存在，请先注册");
    }

    // 检查用户是否被冻结
    if (user.isFrozen === 1) {
      return success(res, "账户已被冻结", {
        isFrozen: true,
        username: user.username,
        frozenReason: user.frozenReason || "违反社区规定",
        frozenAt: user.frozenAt,
        unfreezeAt: user.unfreezeAt,
        freezeType: user.freezeType,
        frozenMessage: user.frozenMessage,
      });
    }

    // 验证验证码
    if (user.code !== code) throw new BadRequestError("验证码错误");
    if (new Date() > user.codeExpire) throw new BadRequestError("验证码已过期");

    // 如果用户没有设置完整信息（临时注册用户），完善用户信息
    if (!user.password || !user.username) {
      await user.update({
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

    // 登录成功
    await handlePostLogin(user, req, res, "邮箱登录");
  } catch (error) {
    failure(res, error);
  }
});

router.get("/validate", userAuth, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);

    // 检查用户是否被冻结
    if (currentUser.isFrozen === 1) {
      // 清除token，强制退出登录
      return failure(res, new UnauthorizedError("账户已被冻结"));
    }
    success(res, "认证成功", {
      userId: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      isFrozen: currentUser.isFrozen,
      nickname: currentUser.nickname,
      avatar: currentUser.avatar,
      role: currentUser.role,
    });
  } catch (error) {
    failure(res, error);
  }
});

//   // 获取用户信息的方法
router.get("/currentuser", userAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    success(res, "获取当前用户信息成功", user);
  } catch (error) {
    failure(res, error);
  }
});
// 添加用户状态检查接口
// router.get("/status", userAuth, async (req, res) => {
//   try {
//     const user = await getCurrentUser(req);
//     success(res, "获取用户状态成功", {
//       isFrozen: user.isFrozen === 1,
//       frozenReason: user.frozenReason,
//       frozenAt: user.frozenAt,
//       unfreezeAt: user.unfreezeAt,
//       freezeType: user.freezeType,
//     });
//   } catch (error) {
//     failure(res, error);
//   }
// });
module.exports = router;
