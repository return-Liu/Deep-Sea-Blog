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

// 通用错误处理函数
function handleAuthError(errorType) {
  throw new UnauthorizedError(AUTH_ERRORS[errorType]);
}

module.exports = async (req, res, next) => {
  try {
    // 验证并提取 token
    const token = extractAndValidateToken(req.headers.authorization);
    const decoded = verifyToken(token);

    // 查询用户信息
    const user = await fetchUserById(decoded.userId);
    validateUserStatus(user);

    // 验证设备信息
    const device = await validateDevice(user.id, req.get("User-Agent"));
    attachUserInfoToRequest(req, user, decoded.userId);

    next();
  } catch (error) {
    failure(res, error);
  }
};

// 提取并验证 Authorization Header
function extractAndValidateToken(authHeader) {
  if (!authHeader) {
    handleAuthError("MISSING_AUTH_HEADER");
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
    handleAuthError("INVALID_AUTH_FORMAT");
  }

  return tokenParts[1];
}

// 验证 JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.SECRET);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      handleAuthError("TOKEN_EXPIRED");
    } else if (err instanceof jwt.JsonWebTokenError) {
      handleAuthError("INVALID_TOKEN");
    } else {
      handleAuthError("TOKEN_VERIFICATION_FAILED");
    }
  }
}

// 查询用户信息
async function fetchUserById(userId) {
  if (!userId) {
    handleAuthError("INCOMPLETE_TOKEN_INFO");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    handleAuthError("USER_NOT_FOUND");
  }

  return user;
}

// 检查用户状态
function validateUserStatus(user) {
  if (user.isFrozen === 1) {
    handleAuthError("USER_FROZEN");
  }
}

// 验证设备信息
async function validateDevice(userId, userAgent) {
  const deviceId = generateDeviceId(userId, userAgent);
  const device = await Device.findOne({
    where: { deviceId, userId },
  });

  if (!device) {
    handleAuthError("DEVICE_NOT_FOUND");
  }

  return device;
}

// 将用户信息附加到请求对象
function attachUserInfoToRequest(req, user, userId) {
  req.userId = userId;
  req.user = user;
}
