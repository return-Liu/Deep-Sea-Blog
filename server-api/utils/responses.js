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

  // 处理 Joi 校验错误
  if (error.isJoi) {
    message = "请求参数错误";
    errors = error.details.map((d) => d.message);
  }
  // 处理 Sequelize 校验错误
  else if (error.name === "SequelizeValidationError") {
    message = "请求参数错误";
    errors = error.errors.map((e) => e.message);
  }
  // 处理自定义 BadRequestError 等
  else if (
    error.name === "BadRequestError" ||
    error.name === "UnauthorizedError" ||
    error.name === "NotFoundError"
  ) {
    message = error.message || message;
    errors = [message];
  }
  // 处理 JWT Token 相关错误
  else if (error.name === "JsonWebTokenError") {
    message = "认证失败：token 错误";
    errors = ["你提交的 token 错误"];
  } else if (error.name === "TokenExpiredError") {
    message = "认证失败：token 已过期";
    errors = ["你提交的 token 过期"];
  }
  // 兜底通用错误
  else {
    message = error.message || message;
    errors = [message];
  }

  res.status(error.statusCode || 500).json({
    status: false,
    message,
    errors,
  });
}
module.exports = {
  success,
  failure,
};
