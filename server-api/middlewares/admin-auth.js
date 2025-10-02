// middlewares/adminAuth.js
const { ForbiddenError } = require("../utils/errors");
const { failure } = require("../utils/responses");

const adminAuth = async (req, res, next) => {
  try {
    // 直接检查 req.user（假设 userAuth 已经执行）
    if (!req.user) {
      throw new ForbiddenError("请先登录");
    }

    // 检查用户是否被冻结
    if (req.user.isFrozen === 1) {
      throw new ForbiddenError("您的账户已被冻结，无法执行此操作");
    }

    // 检查用户角色是否为管理员
    if (req.user.role !== "admin") {
      throw new ForbiddenError("需要管理员权限");
    }

    next();
  } catch (error) {
    failure(res, error);
  }
};

module.exports = adminAuth;
