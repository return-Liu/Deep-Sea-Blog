const { getIPGeoLocation } = require("./ipGeo");
const UAParser = require("ua-parser-js");

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-client-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    "0.0.0.0"
  );
}

async function extractDeviceInfo(req) {
  const userAgent = req.get("User-Agent") || "";
  const ip = getClientIP(req);

  let geoInfo = {
    location: "未知位置",
    raw: null,
  };

  try {
    geoInfo = await getIPGeoLocation(ip);
  } catch (error) {
    console.error("获取地理位置失败:", error);
    geoInfo.location = "未知位置";
  }

  // 使用 ua-parser-js 解析 User-Agent
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // 提取操作系统信息
  const os = result.os.name
    ? `${result.os.name}${result.os.version ? " " + result.os.version : ""}`
    : "Unknown";

  // 提取浏览器信息
  const browser = result.browser.name
    ? `${result.browser.name}${
        result.browser.version ? " " + result.browser.version : ""
      }`
    : "Unknown";

  // 提取设备信息
  const deviceName =
    result.device.vendor && result.device.model
      ? `${result.device.vendor} ${result.device.model}`
      : result.device.type === "mobile"
      ? "Mobile Device"
      : "Unknown Device";

  // 设备类型检测
  let deviceType = "pc";
  if (result.device.type === "mobile") {
    deviceType = "mobile";
  } else if (result.device.type === "tablet") {
    deviceType = "tablet";
  } else if (result.device.type === "smarttv") {
    deviceType = "tv";
  } else if (result.device.type === "wearable") {
    deviceType = "wearable";
  } else if (result.device.type === "console") {
    deviceType = "game-console";
  }

  return {
    deviceType,
    os,
    browser,
    deviceName,
    ip,
    geoLocation: geoInfo.location,
    geoInfo: geoInfo.raw,
    userAgent,
  };
}

module.exports = {
  extractDeviceInfo,
  getClientIP,
};
