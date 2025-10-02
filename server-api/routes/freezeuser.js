const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/user-auth");
const userController = require("../middlewares/user-controller");

// 冻结用户（仅管理员可用）
router.post("/freeze/:id", userAuth, userController.freezeUser);

// 解冻用户（仅管理员可用）
router.post("/unfreeze/:id", userAuth, userController.unfreezeUser);
module.exports = router;
