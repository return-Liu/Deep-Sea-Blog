// utils/responses.js
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("./errors");

/**
  请求成功
  @param res
  @param message
  @param data
  @param code
 */
function success(res, message, data = {}, code = 200) {
  const response = {
    status: 200, // 将 true 改为 200
    message,
  };
  // 只有当 data 不是空对象时才添加 data 字段
  if (Object.keys(data).length > 0) {
    response.data = data;
  }
  return res.status(code).json(response);
}

/**
  请求失败
  @param res
  @param error
 */
function failure(res, error) {
  let message = "系统错误";
  let errors = [];
  let statusCode = error.statusCode || 500;
  let responseData = null;

  // 处理 Joi 校验错误
  if (error.isJoi) {
    message = "请求参数错误";
    errors = error.details.map((d) => d.message);
    statusCode = 400;
  }
  // 处理 Sequelize 校验错误
  else if (error.name === "SequelizeValidationError") {
    message = "请求参数错误";
    errors = error.errors.map((e) => e.message);
    statusCode = 400;
  }
  // 处理自定义错误类
  else if (
    error instanceof BadRequestError ||
    error instanceof UnauthorizedError ||
    error instanceof NotFoundError
  ) {
    message = error.message || message;
    errors = [message];
    statusCode = error.statusCode || statusCode;

    // 如果有额外数据（如冻结信息），保存起来
    if (error.data) {
      responseData = error.data;
    }
  }
  // 处理 JWT Token 相关错误
  else if (error.name === "JsonWebTokenError") {
    message = "认证失败：token 错误";
    errors = ["你提交的 token 错误"];
    statusCode = 401;
  } else if (error.name === "TokenExpiredError") {
    message = "认证失败：token 已过期";
    errors = ["你提交的 token 过期"];
    statusCode = 401;
  }
  // 处理 Sequelize 唯一约束错误
  else if (error.name === "SequelizeUniqueConstraintError") {
    message = "数据已存在";
    errors = error.errors.map((e) => e.message);
    statusCode = 400;
  }
  // 处理 Sequelize 外键错误
  else if (error.name === "SequelizeForeignKeyConstraintError") {
    message = "关联数据错误";
    errors = ["关联的数据不存在"];
    statusCode = 400;
  }
  // 兜底通用错误
  else {
    message = error.message || message;
    errors = [message];
  }

  const response = {
    status: false,
    message,
    errors,
  };

  // 如果有额外数据（如冻结信息），添加到响应中
  if (responseData) {
    response.data = responseData;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  success,
  failure,
};
