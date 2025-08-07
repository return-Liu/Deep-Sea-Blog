const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { createSixNum, send } = require("../utils/email");
const bcrypt = require("bcryptjs");
const { canSendCode } = require("../utils/rateLimiter");
const userAuth = require("../middlewares/user-auth");

// 用于记录密码重置频率（key: userId）
const passwordResetRecords = {};

/**
 * 判断是否允许重置密码
 * @param {number} userId 用户ID
 * @returns {boolean}
 */
function canResetPassword(userId) {
  const now = Date.now();
  const key = `user:${userId}`;
  const record = passwordResetRecords[key] || {
    count: 0,
    firstResetTime: now,
  };

  if (now - record.firstResetTime > 60 * 60 * 1000) {
    passwordResetRecords[key] = {
      count: 1,
      firstResetTime: now,
    };
    return true;
  }

  if (record.count >= 3) {
    return false; // 每小时最多重置3次
  }

  record.count += 1;
  passwordResetRecords[key] = record;
  return true;
}

// ========== 路由定义 ==========

// 发送邮件验证码
router.post("/getemail", userAuth, async (req, res) => {
  try {
    const email = req.body.email;

    const key = `email:${email}`;
    if (!canSendCode(key)) {
      return failure(res, new Error("请求频繁，请明天再试"));
    }

    const code = createSixNum();
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return failure(
        res,
        new Error("该邮箱未被注册，请使用注册过的邮箱进行找回密码！")
      );
    }

    console.log("Generated code:", code);

    // 更新验证码和有效期（5分钟）
    await user.update({
      code,
      codeExpire: new Date(Date.now() + 5 * 60 * 1000),
    });

    await send(email, code);

    success(res, "验证码已发送，请查收您的邮箱");
  } catch (error) {
    console.error(error);
    failure(res, error);
  }
});

// 验证邮箱
router.post("/checkemail", userAuth, async (req, res) => {
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
router.post("/resetpassword", userAuth, async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email) throw new Error("邮箱不能为空");
    if (!code) throw new Error("验证码不能为空");
    if (!password) throw new Error("密码不能为空");

    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("用户不存在");

    if (user.code !== code) throw new Error("验证码错误");
    if (new Date() > user.codeExpire) throw new Error("验证码已过期");

    // 判断是否允许重置密码
    if (!canResetPassword(user.id)) {
      throw new Error("操作频繁，请稍后再试");
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      throw new Error("新密码不能与旧密码相同");
    }

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

// ========== 导出模块 ==========

module.exports = router;
