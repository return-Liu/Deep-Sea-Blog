const express = require("express");
const axios = require("axios");
const router = express.Router();
const { success, failure } = require("../utils/responses");
router.get("/ip-location", async (req, res) => {
  try {
    const key = "ca334a8700bb63318e389db433153db2";
    const response = await axios.get(
      `https://restapi.amap.com/v3/ip?key=${key}`
    );
    console.log(response.data);

    success(res, response.data, "获取位置信息成功");
  } catch (error) {
    console.error("获取位置信息失败:", error);
    failure(res, error);
  }
});
module.exports = router;
