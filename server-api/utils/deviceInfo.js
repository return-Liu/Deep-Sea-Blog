const UAParser = require("ua-parser-js");
const os = require("os");

/**
 * 提取设备信息
 * @param {Object} req - Express 请求对象
 * @returns {Object} - 包含设备信息的对象
 */
async function extractDeviceInfo(req) {
  const userAgent = req.get("User-Agent") || "";
  // 使用 ua-parser-js 解析 User-Agent
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // 提取设备类型
  const deviceType = getDeviceType(result.device.type);

  // 提取操作系统信息
  const osInfo = getOSInfo(result.os);

  // 提取浏览器信息
  const browserInfo = getBrowserInfo(result.browser);

  // 获取设备名称（主机名）
  const deviceName = os.hostname();

  return {
    deviceType,
    os: osInfo,
    browser: browserInfo,
    deviceName,
    userAgent,
  };
}

/**
 * 获取设备类型
 * @param {string} deviceTypeFromUA - 从 User-Agent 中解析出的设备类型
 * @returns {string} - 设备类型
 */
function getDeviceType(deviceTypeFromUA) {
  if (deviceTypeFromUA) {
    switch (deviceTypeFromUA) {
      case "mobile":
        return "mobile";
      case "tablet":
        return "tablet";
      case "smarttv":
        return "tv";
      case "wearable":
        return "wearable";
      case "console":
        return "game-console";
      default:
        return getDeviceTypeFromPlatform();
    }
  } else {
    return getDeviceTypeFromPlatform();
  }
}

/**
 * 根据平台信息获取设备类型
 * @returns {string} - 设备类型
 */
function getDeviceTypeFromPlatform() {
  const platform = os.platform();

  switch (platform) {
    case "android":
      return "mobile";
    case "ios":
      return "mobile";
    default:
      return "pc";
  }
}

/**
 * 获取操作系统信息
 * @param {Object} osResult - 从 User-Agent 中解析出的操作系统信息
 * @returns {string} - 操作系统信息
 */
function getOSInfo(osResult) {
  const osName = osResult.name || getOSNameFromPlatform();
  const osVersion = osResult.version || "未知版本";

  return `${osName} ${osVersion}`;
}

/**
 * 根据平台信息获取操作系统名称
 * @returns {string} - 操作系统名称
 */
function getOSNameFromPlatform() {
  const platform = os.platform();
  const type = os.type();

  switch (platform) {
    case "win32":
      return "Windows";
    case "darwin":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return type || "Unknown OS";
  }
}

/**
 * 获取浏览器信息（简化版）
 * @param {Object} browserResult - 从 User-Agent 中解析出的浏览器信息
 * @returns {string} - 简化后的浏览器名称
 */
function getBrowserInfo(browserResult) {
  const browserName = browserResult.name || "未知浏览器";

  // 自定义映射表：
  const browserMap = {
    QQBrowser: "QQ",
    "Sogou Explorer": "Sogou",
    Chrome: "Chrome",
    Firefox: "Firefox",
    Edge: "Edge",
    Safari: "Safari",
    Opera: "Opera",
    "UC Browser": "UC",
    "360 Browser": "360",
    "Baidu Browser": "Baidu",
    "Yandex Browser": "Yandex",
    Brave: "Brave",
    Vivaldi: "Vivaldi",
    "Microsoft Edge": "Edge",
    "Internet Explorer": "IE",
  };

  return browserMap[browserName] + "浏览器" || browserName + "浏览器"; // 如果没有匹配，则返回原名
}
module.exports = {
  extractDeviceInfo,
};
