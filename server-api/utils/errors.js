// utils/errors.js

// 自定义400
class BadRequestError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.data = data; // 添加data字段
  }
}

// 自定义 401
class UnauthorizedError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.data = data; // 添加data字段用于传递冻结信息
  }
}

// 自定义 404
class NotFoundError extends Error {
  constructor(message, data = null) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    this.data = data; // 添加data字段
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
};
