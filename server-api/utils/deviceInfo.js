const UAParser = require("ua-parser-js");
const os = require("os");

async function extractDeviceInfo(req) {
  const userAgent = req.get("User-Agent") || "";

  // 使用 ua-parser-js 解析 User-Agent
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // 提取操作系统信息（优先使用 UA 解析结果，备选使用 os 模块）
  const osInfo = result.os.name
    ? `${result.os.name}${result.os.version ? " " + result.os.version : ""}`
    : `${getOSNameFromPlatform()} ${os.release()}`;

  // 提取浏览器信息（只能通过 UA 获取）
  let browser = result.browser.name
    ? `${result.browser.name}${
        result.browser.version ? " " + result.browser.version : ""
      }`
    : "Unknown";

  // 获取设备名称（主机名）
  const deviceName = os.hostname();

  // 设备类型检测（优先使用 UA 解析结果，备选使用平台信息）
  let deviceType = "pc";
  if (result.device.type) {
    // 使用 UA 解析的设备类型
    switch (result.device.type) {
      case "mobile":
        deviceType = "mobile";
        break;
      case "tablet":
        deviceType = "tablet";
        break;
      case "smarttv":
        deviceType = "tv";
        break;
      case "wearable":
        deviceType = "wearable";
        break;
      case "console":
        deviceType = "game-console";
        break;
      default:
        deviceType = getDeviceTypeFromPlatform();
    }
  } else {
    // 当 UA 无法提供设备类型时，使用平台信息判断
    deviceType = getDeviceTypeFromPlatform();
  }

  return {
    deviceType,
    os: osInfo,
    browser,
    deviceName,
    userAgent,
  };
}

// 根据平台信息获取操作系统名称
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

// 根据平台信息判断设备类型
function getDeviceTypeFromPlatform() {
  const platform = os.platform();

  // 基于平台信息粗略判断设备类型
  switch (platform) {
    case "android":
      return "mobile";
    case "ios":
      return "mobile";
    default:
      // 默认为 PC，因为服务器通常运行在桌面系统上
      return "pc";
  }
}

module.exports = {
  extractDeviceInfo,
};
