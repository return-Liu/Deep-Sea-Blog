const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const { success, failure } = require("../utils/responses");

module.exports = async (req, res, next) => {
  try {
    // 判断是否有token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("请登录");
    }

    // 提取token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("无效的授权头");
    }

    // 验证token是否有效
    const decoded = jwt.verify(token, process.env.SECRET);

    // 查询用户是否存在
    const { userId } = decoded;
    req.userId = userId;
    next();
  } catch (error) {
    failure(res, error);
  }
};
