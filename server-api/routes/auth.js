const express = require("express");
const router = express.Router();
const { User, Device } = require("../models");
const { success, failure } = require("../utils/responses");
const {
  createSixNum,
  verifyEmailForRegister,
  verifyEmailForLogin,
} = require("../utils/email");
const { canSendCode } = require("../utils/rateLimiter");
const { extractDeviceInfo } = require("../utils/deviceInfo");
const userAuth = require("../middlewares/user-auth");
const { generateKeyPair, decryptPassword } = require("../utils/crypto");
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

// 定期清理过期的验证码（每小时执行一次）
if (!global.verificationCleanupInterval) {
  global.verificationCleanupInterval = setInterval(() => {
    if (global.pendingEmailVerifications) {
      const now = new Date();
      for (const email in global.pendingEmailVerifications) {
        if (global.pendingEmailVerifications[email].expire < now) {
          delete global.pendingEmailVerifications[email];
        }
      }
    }
  }, 60 * 60 * 1000);
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
  const length = 10;
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += randomBytes[i] % 10;
  }
  return result;
}

// 获取当前用户
async function getCurrentUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("未提供身份验证令牌");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("用户不存在");
    }
    return user;
  } catch (err) {
    throw new UnauthorizedError("无效的身份验证令牌");
  }
}

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
        lastLoginTime: new Date(),
        status: "已登录",
        loginMethod: loginMethod,
        loginExpire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        where: { deviceId },
      }
    );
  } else {
    const deviceInfo = await extractDeviceInfo(req);
    const generatedDeviceId = generateDeviceId(user.id, deviceInfo.userAgent);

    let device = await Device.findOne({
      where: {
        deviceId: generatedDeviceId,
      },
    });

    const deviceData = {
      userId: user.id,
      deviceId: generatedDeviceId,
      deviceName: deviceInfo.deviceName || deviceInfo.deviceType || "未知设备",
      deviceType: deviceInfo.deviceType || "unknown",
      os: deviceInfo.os || "unknown",
      loginExpire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      browser: deviceInfo.browser || "unknown",
      lastLoginTime: new Date(),
      userAgent: deviceInfo.userAgent,
      status: "已登录",
      loginMethod: loginMethod,
      lastActiveAt: new Date(),
    };

    if (!device) {
      device = await Device.create(deviceData);
    } else {
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

// 腾讯云验证码配置
const CAPTCHA_CONFIG = {
  CaptchaAppId: process.env.TENCENT_CAPTCHA_APP_ID || 193647721,
  AppSecretKey:
    process.env.TENCENT_CAPTCHA_APP_SECRET_KEY || "9sZmD0EvnyLSO6BZZkhiGLzob",
};

// 存储验证码会话
const captchaSessions = new Map();

// 发送邮箱验证码的公共函数
async function sendEmailVerificationCode(email, clientFeatureCode) {
  try {
    console.log("开始发送邮箱验证码:", email);

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("邮箱格式不正确");
    }

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

    console.log("生成的验证码:", code);

    // 发送对应的邮件
    if (!user) {
      console.log("新用户注册，发送注册验证邮件");
      await verifyEmailForRegister(email, code);
      if (!global.pendingEmailVerifications) {
        global.pendingEmailVerifications = {};
      }
      global.pendingEmailVerifications[email] = {
        code: code,
        expire: new Date(Date.now() + 5 * 60 * 1000),
        clientFeatureCode: clientFeatureCode || "unknown",
      };
    } else {
      console.log("已存在用户，发送登录验证邮件");
      await verifyEmailForLogin(email, code);
      await user.update({
        code,
        codeExpire: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    console.log("邮箱验证码发送成功");
    return true;
  } catch (error) {
    console.error("发送邮箱验证码失败:", error);
    throw error;
  }
}

// 获取腾讯云验证码配置
router.get("/tencent-captcha-config", async (req, res) => {
  try {
    success(res, "获取验证码配置成功", {
      captchaAppId: CAPTCHA_CONFIG.CaptchaAppId,
    });
  } catch (error) {
    failure(res, error);
  }
});

const verificationAttempts = {};

// 验证行为验证码
router.post("/verify-tencent-captcha", async (req, res) => {
  try {
    const { ticket, randstr, captchaAppId, email } = req.body;

    console.log("收到验证请求:", {
      ticket: ticket ? `${ticket.substring(0, 20)}...` : "undefined",
      randstr,
      captchaAppId,
      email,
    });

    if (!ticket || !randstr || !email) {
      throw new BadRequestError("验证参数不完整");
    }

    // 检查验证码尝试次数限制
    const maxAttempts = 5; // 最大尝试次数
    const timeWindow = 60 * 60 * 1000; // 时间窗口：1小时

    const now = Date.now();
    const userKey = email; // 使用邮箱作为唯一标识

    if (
      verificationAttempts[userKey] &&
      verificationAttempts[userKey].count >= maxAttempts &&
      now - verificationAttempts[userKey].lastAttempt < timeWindow
    ) {
      throw new BadRequestError(
        `验证码发送过于频繁，请在 ${Math.ceil(
          (timeWindow - (now - verificationAttempts[userKey].lastAttempt)) /
            1000
        )} 秒后重试`
      );
    }

    // 更新尝试次数
    if (!verificationAttempts[userKey]) {
      verificationAttempts[userKey] = { count: 0, lastAttempt: 0 };
    }
    verificationAttempts[userKey].count += 1;
    verificationAttempts[userKey].lastAttempt = now;

    // 验证 CaptchaAppId
    const receivedAppId = parseInt(captchaAppId);
    const configAppId = parseInt(CAPTCHA_CONFIG.CaptchaAppId);

    if (receivedAppId !== configAppId) {
      throw new BadRequestError("验证码配置错误");
    }

    // 开发环境：直接通过验证并发送验证码
    if (process.env.NODE_ENV === "development") {
      console.log("开发环境：跳过腾讯云验证，直接发送验证码");

      // 简单的本地验证逻辑
      if (ticket && randstr && ticket.length > 10) {
        await sendEmailVerificationCode(email, clientFeatureCode);
        return success(res, "验证成功，验证码已发送"); // 确保只调用一次 success
      } else {
        throw new BadRequestError("验证失败：ticket或randstr无效");
      }
    }

    // 生产环境：需要完整的腾讯云验证
    throw new BadRequestError("生产环境需要配置完整的腾讯云验证");
  } catch (error) {
    console.error("验证码验证失败:", error);
    failure(res, error); // 确保只调用一次 failure
  }
});

// 原有的邮箱验证接口（保持兼容性）
router.post("/email/verify", async (req, res) => {
  try {
    const { email, clientFeatureCode } = req.body;

    if (!email) {
      throw new BadRequestError("邮箱不能为空");
    }

    await sendEmailVerificationCode(email, clientFeatureCode);
    success(res, "验证码发送成功");
  } catch (error) {
    failure(res, error);
  }
});

let keyPair = null;

// // 获取公钥接口
// router.get("/public-key", async (req, res) => {
//   try {
//     if (!keyPair) {
//       keyPair = await generateKeyPair();
//     }
//     success(res, "公钥获取成功", { publicKey: keyPair.publicKey });
//   } catch (error) {
//     failure(res, error);
//   }
// });

// 用户登录
router.post("/sign_in", async (req, res) => {
  try {
    const { login, password } = req.body; // 直接接收明文密码
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

    // 检查用户是否被冻结
    if (user.isFrozen === 1) {
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
    const isPasswordValid = bcrypt.compareSync(password, user.password); // 直接验证明文密码
    if (!isPasswordValid) {
      throw new NotFoundError("密码错误,请输入正确的密码");
    }

    // 登录成功，传递登录方式参数
    await handlePostLogin(user, req, res, "密码登录");
  } catch (error) {
    failure(res, error);
  }
});

// 邮箱验证码登录
router.post("/email", async (req, res) => {
  try {
    const { email, code, clientFeatureCode } = req.body;

    if (!email || !code) {
      throw new BadRequestError("邮箱和验证码不能为空");
    }

    // 查找用户
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // 检查是否存在待验证的验证码
      if (
        !global.pendingEmailVerifications ||
        !global.pendingEmailVerifications[email]
      ) {
        throw new NotFoundError("验证码已过期或未发送，请重新获取验证码");
      }

      const pendingVerification = global.pendingEmailVerifications[email];
      // 验证验证码
      if (pendingVerification.code !== code)
        throw new BadRequestError("验证码错误");
      if (new Date() > pendingVerification.expire)
        throw new BadRequestError("验证码已过期");

      // 验证通过，创建新用户
      try {
        user = await User.create({
          email,
          code: pendingVerification.code,
          codeExpire: pendingVerification.expire,
          uuid: generateUUID(),
          password: bcrypt.hashSync(generatePassword(), 10),
          sex: 0,
          clientFeatureCode: pendingVerification.clientFeatureCode,
          theme: "light",
          role: "user",
          phone: null,
          nickname: generateNickname(),
          username: `user_${generateUUID()}`,
          avatar: null,
          birthday: null,
          introduce: "",
          constellation: null,
          area: null,
          nicknameColor: "#000000",
        });
      } catch (createError) {
        if (createError.name === "SequelizeUniqueConstraintError") {
          throw new BadRequestError("账户创建失败，请稍后重试");
        }
        throw createError;
      }

      // 清除已使用的验证码信息
      delete global.pendingEmailVerifications[email];
    } else {
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
      if (new Date() > user.codeExpire)
        throw new BadRequestError("验证码已过期");

      // 如果用户没有设置完整信息（临时注册用户），完善用户信息
      if (!user.password || !user.username) {
        await user.update({
          password: bcrypt.hashSync(generatePassword(), 10),
          nickname: generateNickname(),
          sex: 0,
          uuid: generateUUID(),
          clientFeatureCode: clientFeatureCode || generateFeatureCode(),
          username: `user_${generateUUID()}`,
          avatar: null,
          birthday: null,
          introduce: "",
          constellation: null,
          area: null,
          nicknameColor: "#000000",
          phone: null,
        });
      }
    }

    // 登录成功
    await handlePostLogin(user, req, res, "邮箱登录");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 获取当前用户绑定的所有账号
 */
router.get("/accounts", userAuth, async (req, res) => {
  try {
    // 获取当前登录用户
    const currentUser = await getCurrentUser(req);

    // 查询与当前用户特征码相同的所有账号
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

    // 检查当前用户组的账号数量是否超过限制
    const accountCount = await User.count({
      where: {
        clientFeatureCode: currentUser.clientFeatureCode,
      },
    });

    if (accountCount > 3) {
      throw new BadRequestError("每个用户最多只能创建3个账号");
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

// 验证token
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

// 刷新token
router.get("/ds-refresh-token", userAuth, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    // 生成新的 token
    const newToken = jwt.sign({ userId: currentUser.id }, process.env.SECRET, {
      expiresIn: "1h",
    });
    success(res, "刷新 Token 成功", { token: newToken });
  } catch (error) {
    failure(res, error);
  }
});

// 获取当前用户信息
router.get("/currentuser", userAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    success(res, "获取当前用户信息成功", {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      role: user.role,
      isFrozen: user.isFrozen,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 用户状态检查接口
router.get("/status", userAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    success(res, "获取用户状态成功", {
      isFrozen: user.isFrozen === 1,
      frozenReason: user.frozenReason,
      frozenAt: user.frozenAt,
      unfreezeAt: user.unfreezeAt,
      freezeType: user.freezeType,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 登出接口
router.post("/logout", userAuth, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);

    // 更新设备状态为已登出
    await Device.update(
      {
        status: "已登出",
        lastActiveAt: new Date(),
      },
      {
        where: { userId: currentUser.id },
      }
    );

    success(res, "登出成功");
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
