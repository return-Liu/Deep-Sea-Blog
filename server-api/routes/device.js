const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/user-auth");
const { User, Device } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError, UnauthorizedError } = require("../utils/errors");
const { Op } = require("sequelize");
const { extractDeviceInfo } = require("../utils/deviceInfo");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 生成设备唯一标识符
function generateDeviceId(userId, userAgent) {
  const hash = crypto.createHash("md5");
  hash.update(`${userId}-${userAgent}`);
  return hash.digest("hex");
}

// 获取当前用户
async function getCurrentUser(req) {
  const token = req.headers.authorization?.split(" ")[1]; // 从请求头中获取 token
  if (!token) {
    throw new UnauthorizedError("未提供身份验证令牌");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET); // 使用 secret 验证 token
    const user = await User.findByPk(decoded.userId); // 根据解码后的 userId 查询用户
    if (!user) {
      throw new UnauthorizedError("用户不存在");
    }
    return user; // 返回当前用户对象
  } catch (err) {
    throw new UnauthorizedError("无效的身份验证令牌");
  }
}

// 登录设备管理
router.post("/login/device", userAuth, async (req, res) => {
  try {
    // 获取当前用户
    const currentUser = await getCurrentUser(req);

    // 提取设备信息
    const deviceInfo = await extractDeviceInfo(req);
    const deviceId = generateDeviceId(currentUser.id, deviceInfo.userAgent);

    // 查找或创建设备记录
    let device = await Device.findOne({
      where: {
        deviceId: deviceId,
      },
    });

    // 确保所有必需字段都有默认值
    const deviceData = {
      userId: currentUser.id,
      deviceId: deviceId,
      deviceName: deviceInfo.deviceName || deviceInfo.deviceType || "未知设备",
      deviceType: deviceInfo.deviceType || "unknown",
      os: deviceInfo.os || "unknown",
      browser: deviceInfo.browser || "unknown",
      lastLoginTime: new Date(),
      userAgent: deviceInfo.userAgent,
      location: deviceInfo.location || "未知位置",
      province: deviceInfo.province || "未知省",
      loginExpire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7天后过期
      lastActiveAt: new Date(),
    };

    if (!device) {
      // 创建设备记录前确保所有必需字段都已设置
      device = await Device.create(deviceData);
    } else {
      // 更新最后登录时间
      await device.update({
        lastLoginTime: new Date(),
      });
    }

    success(res, "设备信息记录成功", {
      deviceId: device.deviceId,
      isTrusted: device.isTrusted,
    });
  } catch (error) {
    console.error("设备记录失败:", error);
    failure(res, error);
  }
});

// 获取用户所有登录设备
router.get("/devices", async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const currentDeviceInfo = await extractDeviceInfo(req);
    const currentDeviceId = generateDeviceId(
      currentUser.id,
      currentDeviceInfo.userAgent
    );

    // 查询所有设备，不仅限于"已登录"状态
    const devices = await Device.findAll({
      where: { userId: currentUser.id },
      order: [["lastLoginTime", "DESC"]],
    });

    const formattedDevices = devices.map((device) => ({
      id: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      lastLoginTime: device.lastLoginTime,
      isTrusted: device.isTrusted,
      location: device.location,
      city: device.city,
      province: device.province,
      trustExpire: device.trustExpire,
      isCurrentDevice: device.deviceId === currentDeviceId,
      loginMethod: device.loginMethod || "未知登录方式",
      status: device.status,
      loginExpire: device.loginExpire,
      lastActiveAt: device.lastActiveAt,
    }));

    success(res, "获取设备列表成功", formattedDevices);
  } catch (error) {
    failure(res, error);
  }
});

// 删除登录设备
router.delete("/devices/:deviceId", async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    const { deviceId } = req.params;

    // 检查设备是否属于当前用户
    const device = await Device.findOne({
      where: {
        deviceId: deviceId,
        userId: currentUser.id,
      },
    });

    if (!device) {
      throw new NotFoundError("设备不存在或不属于当前用户");
    }

    // 直接删除设备，实现强制下线
    await device.destroy();

    success(res, "设备删除成功");
  } catch (error) {
    failure(res, error);
  }
});
module.exports = router;
