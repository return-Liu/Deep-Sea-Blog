const express = require("express");
const axios = require("axios");
const router = express.Router();
const { success, failure } = require("../utils/responses");

// IP定位接口
router.get("/ip-location", async (req, res) => {
  try {
    const key = "ca334a8700bb63318e389db433153db2";
    const response = await axios.get(
      `https://restapi.amap.com/v3/ip?key=${key}`
    );

    console.log("IP定位结果:", response.data);

    if (response.data.status === "1") {
      success(res, response.data, "获取位置信息成功");
    } else {
      failure(res, response.data.info || "定位失败");
    }
  } catch (error) {
    console.error("获取位置信息失败:", error);
    failure(res, "定位服务暂时不可用");
  }
});

// 新增：通过经纬度获取地址信息
router.get("/geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return failure(res, "经纬度参数缺失");
    }

    const key = "ca334a8700bb63318e389db433153db2";
    const response = await axios.get(
      `https://restapi.amap.com/v3/geocode/regeo`,
      {
        params: {
          key,
          location: `${lng},${lat}`,
          extensions: "base",
        },
      }
    );

    if (response.data.status === "1") {
      const addressComponent = response.data.regeocode.addressComponent;
      success(
        res,
        {
          province: addressComponent.province,
          city: addressComponent.city || addressComponent.province, // 处理直辖市
          district: addressComponent.district,
          formattedAddress: response.data.regeocode.formatted_address,
        },
        "获取地址信息成功"
      );
    } else {
      failure(res, response.data.info || "地理编码失败");
    }
  } catch (error) {
    console.error("地理编码失败:", error);
    failure(res, "地理编码服务暂时不可用");
  }
});

module.exports = router;
