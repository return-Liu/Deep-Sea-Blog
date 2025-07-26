const axios = require("axios");

// 高德地图逆地理编码 API
const REGEOCODE_API_URL = "https://restapi.amap.com/v3/geocode/regeo";

// 获取逆地理编码信息
async function getRegeoLocation(location) {
  try {
    const response = await axios.get(REGEOCODE_API_URL, {
      params: {
        key: "84c8fc9794d45e1bbb56bad2d8a7da05", // 替换为您的高德地图 API Key
        location: location, // 经纬度坐标，格式为 "经度,纬度"
        output: "JSON", // 返回数据格式，默认为 JSON
      },
    });

    if (response.status === 200 && response.data.status === "1") {
      // 解析返回结果
      const regeocode = response.data.regeocode;
      if (regeocode && regeocode.formatted_address) {
        return regeocode.formatted_address; // 返回标准地址
      } else {
        console.warn("逆地理编码结果为空");
        return null;
      }
    } else {
      console.error("逆地理编码请求失败:", response.data.info);
      return null;
    }
  } catch (error) {
    console.error("逆地理编码请求异常:", error.message);
    return null;
  }
}

// 示例调用
(async () => {
  const location = "360.0,360.0"; // 江西宜春
  const address = await getRegeoLocation(location);
  console.log("地址:", address);
})();
