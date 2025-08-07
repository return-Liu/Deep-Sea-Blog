const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");
const userAuth = require("../middlewares/user-auth");

// 获取主题
router.get("/:uuid/style", userAuth, async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await User.findOne({
      where: { uuid },
    });

    if (!user) {
      throw new NotFoundError("用户不存在");
    }
    success(res, "获取主题信息成功", { theme: user.theme });
  } catch (error) {
    failure(res, error);
  }
});

// 更新主题
router.put("/:uuid/style", userAuth, async (req, res) => {
  try {
    const { uuid } = req.params;
    const { theme } = req.body;
    const user = await User.findOne({
      where: { uuid },
    });
    if (!user) {
      throw new NotFoundError("用户不存在");
    }

    await user.update({ theme });
    success(res, "更新主题信息成功", { theme });
  } catch (error) {
    failure(res, error);
  }
});
module.exports = router;
