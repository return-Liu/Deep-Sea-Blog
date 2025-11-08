const jwt = require("jsonwebtoken");
const { User, Device } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const { failure } = require("../utils/responses");
const crypto = require("crypto");

// 生成设备唯一标识符
function generateDeviceId(userId, userAgent) {
  const hash = crypto.createHash("md5");
  hash.update(`${userId}-${userAgent}`);
  return hash.digest("hex");
}

// 定义认证相关的错误消息常量
const AUTH_ERRORS = {
  MISSING_AUTH_HEADER: "未检测到登录信息，请重新登录",
  INVALID_AUTH_FORMAT: "无效的授权头格式",
  TOKEN_EXPIRED: "登录凭证已过期，请重新登录",
  INVALID_TOKEN: "登录凭证无效，请重新登录",
  TOKEN_VERIFICATION_FAILED: "登录凭证验证失败，请重新登录",
  INCOMPLETE_TOKEN_INFO: "登录凭证信息不完整，请重新登录",
  USER_NOT_FOUND: "用户不存在或已经注销",
  USER_FROZEN: "您的账户已被冻结，请联系管理员",
  DEVICE_NOT_FOUND: "登录设备不存在，请重新登录", // 添加设备不存在错误消息
};

module.exports = async (req, res, next) => {
  try {
    // 判断是否有token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError(AUTH_ERRORS.MISSING_AUTH_HEADER);
    }

    // 提取token
    const tokenParts = authHeader.split(" ");
    if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_AUTH_FORMAT);
    }

    const token = tokenParts[1];

    // 验证token是否有效
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError(AUTH_ERRORS.TOKEN_EXPIRED);
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError(AUTH_ERRORS.INVALID_TOKEN);
      } else {
        throw new UnauthorizedError(AUTH_ERRORS.TOKEN_VERIFICATION_FAILED);
      }
    }

    // 查询用户是否存在
    const { userId } = decoded;
    if (!userId) {
      throw new UnauthorizedError(AUTH_ERRORS.INCOMPLETE_TOKEN_INFO);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.USER_NOT_FOUND);
    }

    // 检查用户冻结状态
    if (user.isFrozen === 1) {
      throw new UnauthorizedError(AUTH_ERRORS.USER_FROZEN);
    }

    // 检查设备是否存在（用于强制下线功能）
    const deviceInfo = req.get("User-Agent") || "";
    const deviceId = generateDeviceId(userId, deviceInfo);
    const device = await Device.findOne({
      where: {
        deviceId: deviceId,
        userId: userId,
      },
    });

    if (!device) {
      throw new UnauthorizedError(AUTH_ERRORS.DEVICE_NOT_FOUND);
    }

    // 将用户信息附加到请求对象
    req.userId = userId;
    req.user = user;
    next();
  } catch (error) {
    failure(res, error);
  }
};
