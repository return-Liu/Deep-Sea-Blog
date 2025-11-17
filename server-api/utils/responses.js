const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("./errors");

/**
 * 请求成功
 * @param {Object} res - Express 响应对象
 * @param {string} message - 成功消息
 * @param {Object} data - 返回的数据，默认为空对象
 * @param {number} code - HTTP 状态码，默认为 200
 */
function success(res, message, data = {}, code = 200) {
  const response = {
    status: true,
    message,
  };
  if (Object.keys(data).length > 0) {
    response.data = data; // 只有非空数据才添加 data 字段
  }
  return res.status(code).json(response);
}

/**
 * 请求失败
 * @param {Object} res - Express 响应对象
 * @param {Error} error - 错误对象
 */
function failure(res, error) {
  let message = "系统错误";
  let errors = [];
  let statusCode = error.statusCode || 500;
  let responseData = null;

  // 错误处理逻辑
  switch (true) {
    case error.isJoi:
      message = "请求参数错误";
      errors = error.details.map((d) => d.message);
      statusCode = 400;
      break;

    case error.name === "SequelizeValidationError":
      message = "请求参数错误";
      errors = error.errors.map((e) => e.message);
      statusCode = 400;
      break;

    case error instanceof BadRequestError ||
      error instanceof UnauthorizedError ||
      error instanceof NotFoundError:
      message = error.message || message;
      errors = [message];
      statusCode = error.statusCode || statusCode;
      if (error.data) {
        responseData = error.data; // 保存额外数据
      }
      break;

    case error.name === "JsonWebTokenError":
      message = "认证失败：token 错误";
      errors = ["你提交的 token 错误"];
      statusCode = 401;
      break;

    case error.name === "TokenExpiredError":
      message = "认证失败：token 已过期";
      errors = ["你提交的 token 过期"];
      statusCode = 401;
      break;

    case error.name === "SequelizeUniqueConstraintError":
      message = "数据已存在";
      errors = error.errors.map((e) => e.message);
      statusCode = 400;
      break;

    case error.name === "SequelizeForeignKeyConstraintError":
      message = "关联数据错误";
      errors = ["关联的数据不存在"];
      statusCode = 400;
      break;

    default:
      message = error.message || message;
      errors = [message];
      console.error("未处理的错误:", error); // 记录未处理的错误
      break;
  }

  // 构建响应结构
  const response = {
    status: false,
    message,
    errors,
  };

  if (responseData) {
    response.data = responseData; // 添加额外数据
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  success,
  failure,
};
