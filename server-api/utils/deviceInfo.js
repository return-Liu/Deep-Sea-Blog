const { getIPGeoLocation } = require("./ipGeo");

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
    location: "获取中...",
    raw: null,
  };

  try {
    geoInfo = await getIPGeoLocation(ip);
  } catch (error) {
    console.error("获取地理位置失败:", error);
  }

  // 操作系统检测
  const osPatterns = [
    { pattern: /Windows NT 10.0/, name: "Windows 10/11" },
    { pattern: /Windows NT 6.3/, name: "Windows 8.1" },
    { pattern: /Windows NT 6.2/, name: "Windows 8" },
    { pattern: /Windows NT 6.1/, name: "Windows 7" },
    { pattern: /Windows NT 6.0/, name: "Windows Vista" },
    { pattern: /Windows NT 5.1/, name: "Windows XP" },
    { pattern: /Macintosh.*Mac OS X (\d+)_(\d+)_(\d+)/, name: "macOS" },
    { pattern: /Linux/, name: "Linux" },
    { pattern: /Android (\d+\.\d+)/, name: "Android" },
    { pattern: /iPhone|iPad/, name: "iOS" },
    { pattern: /CrOS/, name: "Chrome OS" },
    { pattern: /Windows/, name: "Windows" },
    { pattern: /Macintosh/, name: "macOS" },
  ];

  // 浏览器检测
  const browserPatterns = [
    { pattern: /Edg\/([\d.]+)/, name: "Microsoft Edge" },
    { pattern: /Chrome\/([\d.]+)/, name: "Google Chrome" },
    { pattern: /Firefox\/([\d.]+)/, name: "Mozilla Firefox" },
    { pattern: /Safari\/([\d.]+)/, name: "Safari" },
    { pattern: /OPR\/([\d.]+)/, name: "Opera" },
    { pattern: /Trident\/7.0/, name: "Internet Explorer 11" },
    { pattern: /MSIE ([\d.]+)/, name: "Internet Explorer" },
  ];

  // 检测操作系统
  let os = "Unknown";
  for (const osPattern of osPatterns) {
    if (osPattern.pattern.test(userAgent)) {
      os = osPattern.name;
      break;
    }
  }

  // 检测浏览器
  let browser = "Unknown";
  for (const browserPattern of browserPatterns) {
    const match = userAgent.match(browserPattern.pattern);
    if (match) {
      browser = browserPattern.name;
      if (match[1]) {
        browser += ` ${match[1]}`;
      }
      break;
    }
  }

  // 设备类型检测
  let deviceType = "pc";
  let deviceName = "Unknown Device";

  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = "mobile";
    if (/iPad/i.test(userAgent)) {
      deviceType = "tablet";
      deviceName = "iPad";
    } else if (/Tablet|Tab/i.test(userAgent)) {
      deviceType = "tablet";
      deviceName = "Android Tablet";
    } else if (/iPhone|iPod/i.test(userAgent)) {
      deviceName = "iPhone";
    } else if (/Android/i.test(userAgent)) {
      deviceName = "Android Phone";
    } else {
      deviceName = "Mobile Device";
    }
  } else if (/SmartTV|HbbTV|AppleTV|GoogleTV|Roku|PhilipsTV/i.test(userAgent)) {
    deviceType = "tv";
    deviceName = "Smart TV";
  } else if (/Xbox|PlayStation|Nintendo/i.test(userAgent)) {
    deviceType = "game-console";
    deviceName = "Game Console";
  } else if (/Watch|Wear OS|Android Wear/i.test(userAgent)) {
    deviceType = "wearable";
    deviceName = "Smart Watch";
  } else {
    if (/Macintosh/i.test(userAgent)) {
      deviceName = "Mac";
    } else if (/Windows/i.test(userAgent)) {
      deviceName = "Windows PC";
    } else if (/Linux/i.test(userAgent)) {
      deviceName = "Linux PC";
    }
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
