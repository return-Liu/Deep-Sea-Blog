const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { UnauthorizedError } = require("../utils/errors");
const { failure } = require("../utils/responses");

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
  USER_TEMPORARY_FROZEN: "您的账户已被临时冻结",
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

    // 检查用户冻结状态（支持自动解冻）
    if (user.isFrozen === 1) {
      const now = new Date();

      // 检查是否是临时冻结且已到解冻时间
      if (
        user.freezeType === "temporary" &&
        user.unfreezeAt &&
        now >= user.unfreezeAt
      ) {
        // 自动解冻用户
        await user.update({
          isFrozen: 0,
          frozenReason: null,
          frozenAt: null,
          unfreezeAt: null,
          freezeType: null,
          frozenMessage: null,
        });

        console.log(`用户 ${user.id} 已自动解冻`);
      } else {
        // 用户仍在冻结中，返回详细的冻结信息
        const freezeInfo = {
          isFrozen: true,
          userId: user.id,
          frozenReason: user.frozenReason || "违反社区规定",
          frozenAt: user.frozenAt,
          unfreezeAt: user.unfreezeAt,
          freezeType: user.freezeType || "temporary",
          message:
            user.frozenMessage || "您的账户已被冻结，如有疑问请联系客服。",
        };

        // 根据冻结类型返回不同的错误信息
        if (user.freezeType === "temporary" && user.unfreezeAt) {
          const timeLeft = user.unfreezeAt - now;
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );

          let timeMessage = "";
          if (days > 0) {
            timeMessage = `，剩余 ${days} 天 ${hours} 小时`;
          } else if (hours > 0) {
            timeMessage = `，剩余 ${hours} 小时`;
          } else {
            timeMessage = `，即将解冻`;
          }

          throw new UnauthorizedError(
            `${AUTH_ERRORS.USER_TEMPORARY_FROZEN}${timeMessage}`,
            freezeInfo
          );
        } else {
          // 永久冻结或无解冻时间的临时冻结
          throw new UnauthorizedError(AUTH_ERRORS.USER_FROZEN, freezeInfo);
        }
      }
    }

    // 将用户信息附加到请求对象
    req.userId = userId;
    req.user = user;
    next();
  } catch (error) {
    failure(res, error);
  }
};
