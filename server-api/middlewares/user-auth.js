const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const { failure } = require("../utils/responses");

module.exports = async (req, res, next) => {
  try {
    // 判断是否有token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("请登录");
    }

    // 提取token
    const tokenParts = authHeader.split(" ");
    if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
      throw new UnauthorizedError("无效的授权头");
    }

    const token = tokenParts[1];

    // 验证token是否有效
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("token已过期");
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("无效的token");
      } else {
        throw new UnauthorizedError("token验证失败");
      }
    }

    // 查询用户是否存在
    const { userId } = decoded;
    if (!userId) {
      throw new UnauthorizedError("token信息不完整");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new UnauthorizedError("用户不存在");
    }

    // 将用户信息附加到请求对象
    req.userId = userId;
    req.user = user;
    next();
  } catch (error) {
    failure(res, error);
  }
};
