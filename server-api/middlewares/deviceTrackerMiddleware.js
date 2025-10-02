// middlewares/deviceTrackerMiddleware.js
const { Device } = require("../models");

const deviceTrackerMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const deviceId = req.body.deviceId;

    if (deviceId) {
      let userId = null;
      // 如果有token，尝试解析用户ID
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.SECRET);
          userId = decoded.userId;
        } catch (error) {
          // token无效，不处理
        }
      }

      // 更新设备活跃时间（不更新登录时间）
      await Device.upsert(
        {
          deviceId,
          userId: userId,
          userAgent,
          lastActiveAt: new Date(),
          // 注意：这里不更新 lastLoginTime，只有在登录时才更新
        },
        {
          where: { deviceId },
        }
      );
    }
  } catch (error) {
    console.error("设备跟踪中间件错误:", error);
  }

  next();
};

module.exports = deviceTrackerMiddleware;
