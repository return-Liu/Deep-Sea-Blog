const express = require("express");
const axios = require("axios");
const router = express.Router();
const { success, failure } = require("../utils/responses");

// IP定位接口
router.get("/ip-location", async (req, res) => {
  try {
    const key = "ca334a8700bb63318e389db433153db2";

    // Step 1: 获取经纬度
    const ipResponse = await axios.get(
      `https://restapi.amap.com/v3/ip?key=${key}`
    );
    const { province, city } = ipResponse.data;
    if (!province || !city) {
      throw new Error("无法获取IP的省份或城市信息");
    }
    return success(res, "获取IP定位成功", { province, city });
  } catch (error) {
    return failure(res, error.message);
  }
});

module.exports = router;
