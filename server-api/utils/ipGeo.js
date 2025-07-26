const axios = require("axios");

// 高德地图地理编码 API
const GEOCODE_API_URL = "https://restapi.amap.com/v3/geocode/geo";

// 获取地理编码信息
async function getGeocodeLocation(address, city) {
  try {
    const response = await axios.get(GEOCODE_API_URL, {
      params: {
        key: "84c8fc9794d45e1bbb56bad2d8a7da05", // 替换为您的高德地图 API Key
        address: address, // 结构化地址信息
        city: city, // 指定查询的城市
        output: "JSON", // 返回数据格式，默认为 JSON
      },
    });

    if (response.status === 200 && response.data.status === "1") {
      // 解析返回结果
      const geocodes = response.data.geocodes;
      if (geocodes && geocodes.length > 0) {
        return geocodes[0].location; // 返回经纬度坐标
      } else {
        console.warn("地理编码结果为空");
        return null;
      }
    } else {
      console.error("地理编码请求失败:", response.data.info);
      return null;
    }
  } catch (error) {
    console.error("地理编码请求异常:", error.message);
    return null;
  }
}

// 示例调用
(async () => {
  const address = "宜春市"; // 地址
  const city = "奉新"; // 城市
  const location = await getGeocodeLocation(address, city);
  console.log("经纬度坐标:", location);
})();

// 导出函数
module.exports = {
  getGeocodeLocation,
};
