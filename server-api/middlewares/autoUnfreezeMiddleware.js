const { User } = require("../models");

const autoUnfreezeMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);
      const user = await User.findByPk(decoded.userId);

      if (
        user &&
        user.isFrozen &&
        user.freezeType === "temporary" &&
        user.unfreezeAt
      ) {
        // 检查是否需要解冻
        if (new Date() >= new Date(user.unfreezeAt)) {
          await user.update({
            isFrozen: 0,
            frozenReason: null,
            frozenAt: null,
            unfreezeAt: null,
            freezeType: null,
            frozenMessage: null,
          });
          console.log(`用户 ${user.username} 已自动解冻`);
        }
      }
    }
  } catch (error) {
    // 不中断请求流程
    console.error("自动解冻检查错误:", error);
  }

  next();
};

module.exports = autoUnfreezeMiddleware;
