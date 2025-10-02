const express = require("express");
const router = express.Router();
const { User, Device } = require("../models");
const { success, failure } = require("../utils/responses");
const { createSixNum, verifyEmail } = require("../utils/email");
const { canSendCode } = require("../utils/rateLimiter");
const { extractDeviceInfo } = require("../utils/deviceInfo");
const userAuth = require("../middlewares/user-auth");
const adminAuth = require("../middlewares/admin-auth");
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
      },
      {
        where: { deviceId },
      }
    );
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

// 邮箱验证码登录
router.post("/email", async (req, res) => {
  try {
    const { email, code, clientFeatureCode } = req.body;

    // 查找用户，如果不存在则创建
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // 如果用户不存在，创建新用户
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

    // 登录成功
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

    // 只查找用户，不再创建用户
    const user = await User.findOne({ where: { email } });

    // 如果用户不存在，直接返回错误
    if (!user) {
      throw new NotFoundError("用户不存在，请先注册");
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
router.post("/login/device", userAuth, async (req, res) => {
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
router.get("/devices", userAuth, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const currentDeviceInfo = await extractDeviceInfo(req);
    const currentDeviceId = generateDeviceId(
      currentUser.id,
      currentDeviceInfo.userAgent
    );

    // 只查询状态为"已登录"的设备
    const devices = await Device.findAll({
      where: {
        userId: currentUser.id,
        status: "已登录",
      },
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

// 删除登录设备
router.delete("/devices/:id", userAuth, async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const { id } = req.params;

    const device = await Device.findOne({
      where: { id, userId: currentUser.id },
    });
    if (!device) {
      throw new NotFoundError("设备不存在");
    }
    await device.destroy();
    success(res, "设备删除成功");
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

    success(res, "Token 有效", {
      userId: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      isFrozen: currentUser.isFrozen,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 添加专门的冻结状态检查接口
router.get("/freeze/status", userAuth, async (req, res) => {
  try {
    const currentUser = req.user; // 直接从 req.user 获取，不需要再查询数据库

    if (currentUser.isFrozen === 1) {
      // 检查是否临时冻结且已到解冻时间
      const now = new Date();
      if (
        currentUser.freezeType === "temporary" &&
        currentUser.unfreezeAt &&
        now >= currentUser.unfreezeAt
      ) {
        // 自动解冻
        await currentUser.update({
          isFrozen: 0,
          frozenReason: null,
          frozenAt: null,
          unfreezeAt: null,
          freezeType: null,
          frozenMessage: null,
          frozenBy: null,
        });

        return success(res, "账户正常", {
          isFrozen: false,
        });
      }

      // 构建冻结信息
      const freezeInfo = {
        isFrozen: 1,
        frozenReason: currentUser.frozenReason || "违反社区规定",
        frozenAt: currentUser.frozenAt,
        username: currentUser.username,
        frozenMessage:
          currentUser.frozenMessage || "您的账户已被冻结，如有疑问请联系客服。",
        unfreezeAt: currentUser.unfreezeAt,
        freezeType: currentUser.freezeType,
      };

      // 如果是临时冻结，添加剩余时间信息
      if (currentUser.freezeType === "temporary" && currentUser.unfreezeAt) {
        const timeLeft = currentUser.unfreezeAt - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        freezeInfo.timeLeft = {
          days,
          hours,
          totalMs: timeLeft,
        };

        if (days > 0) {
          freezeInfo.timeLeftMessage = `剩余 ${days} 天 ${hours} 小时`;
        } else if (hours > 0) {
          freezeInfo.timeLeftMessage = `剩余 ${hours} 小时`;
        } else {
          freezeInfo.timeLeftMessage = `即将解冻`;
        }
      }

      return success(res, "账户已被冻结", freezeInfo);
    } else {
      return success(res, "账户正常", {
        isFrozen: false,
      });
    }
  } catch (error) {
    failure(res, error);
  }
});

// 添加冻结用户的接口（管理员权限）
router.post("/freeze", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId, reason, freezeType, durationDays } = req.body;

    if (!userId || !reason || !freezeType) {
      return failure(
        res,
        new BadRequestError("用户ID、冻结原因和冻结类型不能为空")
      );
    }

    if (freezeType !== "temporary" && freezeType !== "permanent") {
      return failure(
        res,
        new BadRequestError("冻结类型必须是 temporary 或 permanent")
      );
    }

    if (freezeType === "temporary" && (!durationDays || durationDays <= 0)) {
      return failure(
        res,
        new BadRequestError("临时冻结必须提供有效的冻结天数")
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, new NotFoundError("用户不存在"));
    }

    // 计算解冻时间（如果是临时冻结）
    let unfreezeAt = null;
    let frozenMessage = "";

    if (freezeType === "temporary") {
      unfreezeAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      frozenMessage = `您的账户因以下原因被临时冻结：${reason}。冻结期限：${durationDays}天，预计解冻时间：${unfreezeAt.toLocaleString()}。`;
    } else {
      frozenMessage = `您的账户因以下原因被永久冻结：${reason}。如有疑问请联系客服。`;
    }

    // 冻结用户
    await user.update({
      isFrozen: 1,
      frozenReason: reason,
      frozenAt: new Date(),
      frozenBy: req.user.id,
      freezeType: freezeType,
      unfreezeAt: unfreezeAt,
      frozenMessage: frozenMessage,
    });

    const responseData = {
      userId: user.id,
      username: user.username,
      isFrozen: 1,
      frozenReason: reason,
      frozenAt: new Date(),
      freezeType: freezeType,
      unfreezeAt: unfreezeAt,
    };

    if (freezeType === "temporary") {
      responseData.durationDays = durationDays;
    }

    return success(
      res,
      `用户已${freezeType === "temporary" ? "临时" : "永久"}冻结`,
      responseData
    );
  } catch (error) {
    failure(res, error);
  }
});

// 添加解冻用户的接口（管理员权限）
router.post("/unfreeze", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return failure(res, new BadRequestError("用户ID不能为空"));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, new NotFoundError("用户不存在"));
    }

    // 解冻用户
    await user.update({
      isFrozen: 0,
      frozenReason: null,
      frozenAt: null,
      unfreezeAt: null,
      freezeType: null,
      frozenMessage: null,
      frozenBy: null,
    });

    return success(res, "用户已解冻", {
      userId: user.id,
      username: user.username,
      isFrozen: 0,
    });
  } catch (error) {
    failure(res, error);
  }
});
module.exports = router;
