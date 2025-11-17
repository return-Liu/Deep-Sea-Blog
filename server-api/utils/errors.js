// utils/errors.js

// 自定义 400 错误
class BadRequestError extends Error {
  constructor(message = "请求参数错误", data = null) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.data = isValidData(data) ? data : null; // 验证 data 类型
  }
}

// 自定义 401 错误
class UnauthorizedError extends Error {
  constructor(message = "认证失败", data = null) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.data = isValidData(data) ? data : null; // 验证 data 类型
  }
}

// 自定义 403 错误
class ForbiddenError extends Error {
  constructor(message = "权限不足", data = null) {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
    this.data = isValidData(data) ? data : null; // 验证 data 类型
  }
}

// 自定义 404 错误
class NotFoundError extends Error {
  constructor(message = "资源未找到", data = null) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.data = isValidData(data) ? data : null; // 验证 data 类型
  }
}

// 辅助函数：验证 data 是否为对象或数组
function isValidData(data) {
  return data && (typeof data === "object" || Array.isArray(data));
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
