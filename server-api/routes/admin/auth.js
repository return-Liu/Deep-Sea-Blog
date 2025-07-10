// const express = require("express");
// const router = express.Router();
// const { User } = require("../../models");
// const { Op } = require("sequelize");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// // const crypto = require("crypto");
// const {
//   BadRequestError,
//   UnauthorizedError,
//   NotFoundError,
// } = require("../../utils/errors");
// const { success, failure } = require("../../utils/responses");

// /**
//  管理员登录
//  POST admin/auth/sign_in
//  */
// router.post("/sign_in", async (req, res) => {
//   try {
//     // console.log(crypto.randomBytes(32).toString("hex"));
//     const { login, password } = req.body;
//     if (!login) {
//       throw new BadRequestError("邮箱/用户名必须填写!");
//     }
//     if (!password) {
//       throw new BadRequestError("密码必须填写!");
//     }
//     const condition = {
//       where: {
//         [Op.or]: [{ email: login }, { username: login }],
//       },
//     };
//     const user = await User.findOne(condition);
//     if (!user) throw new NotFoundError("用户不存在, 请先注册账号!");
//     // 验证密码是否正确
//     const isPasswordValid = bcrypt.compareSync(password, user.password);
//     if (!isPasswordValid) throw new UnauthorizedError("密码错误");
//     // 验证是否管理员
//     if (user.role !== 1) throw new UnauthorizedError("非管理员用户无法登录");
//     // 生成身份验证令牌
//     const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
//       expiresIn: "30h",
//     });
//     success(res, "登录成功", {
//       token,
//     });
//   } catch (error) {
//     failure(res, error);
//   }
// });
// module.exports = router;
