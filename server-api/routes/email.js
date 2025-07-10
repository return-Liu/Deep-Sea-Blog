// routes/email.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { createSixNum, send } = require("../utils/email");
const bcrypt = require("bcryptjs");
const { BadRequestError } = require("../utils/errors");
// 发送邮件
router.post("/getemail", async (req, res) => {
  try {
    const email = req.body.email;
    const code = createSixNum();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return failure(
        res,
        new Error("该邮箱未被注册，请使用注册过的邮箱进行找回密码！")
      );
    }

    console.log("Generated code:", code);

    // 更新验证码和有效期（1分钟）
    await user.update({
      code,
      codeExpire: new Date(Date.now() + 1 * 60 * 1000),
    });

    await send(email, code);
    success(res, "验证码已发送，请查收您的邮箱");
  } catch (error) {
    console.error(error);
    failure(res, error);
  }
});

// 验证邮箱
router.post("/checkemail", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email) throw new Error("邮箱不能为空");
    if (!code) throw new Error("验证码不能为空");
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("用户不存在");

    console.log("Stored code:", user.code);
    console.log("Code expire time:", user.codeExpire);

    if (new Date() > user.codeExpire) throw new Error("验证码已过期");
    if (user.code !== code) throw new Error("验证码错误");

    success(res, "验证成功");
  } catch (error) {
    console.error("Error in checkemail:", error.message);
    failure(res, error);
  }
});
// 重置密码
router.post("/resetpassword", async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email) throw new Error("邮箱不能为空");
    if (!code) throw new Error("验证码不能为空");
    if (!password) throw new Error("密码不能为空");
    console.log("Received email:", email);
    console.log("Received code:", code);
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("用户不存在");
    if (user.code !== code) throw new Error("验证码错误");
    if (new Date() > user.codeExpire) throw new Error("验证码已过期");
    // 比较新密码和旧密码
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      throw new Error("新密码不能与旧密码相同");
    }
    // 哈希处理新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      code: null,
      codeExpire: null,
    });
    success(res, "密码重置成功");
  } catch (error) {
    console.error("Error in resetpassword:", error.message);
    failure(res, error);
  }
});

module.exports = router;
