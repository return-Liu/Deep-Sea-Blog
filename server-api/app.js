const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors"); // 引入 cors 中间件
const userAuth = require("./middlewares/user-auth");

require("dotenv").config();
// 前台路由
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const searchRouter = require("./routes/search");
const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email");
// 后台路由
// const adminAuthRouter = require("./routes/admin/auth");
const adminArticleRouter = require("./routes/admin/article");
const adminPhotographyRouter = require("./routes/admin/photography");
const adminNoteRouter = require("./routes/admin/note");
const adminLikesRouter = require("./routes/admin/likes");
const adminUploadAvatarRouter = require("./routes/admin/uploadavatar");
const adminFeedbackRouter = require("./routes/admin/feedback");
const adminUpdateRouter = require("./routes/admin/update");
const adminUploadRouter = require("./routes/admin/upload");
const adminWallRouter = require("./routes/admin/wall");
const adminLikesWallRouter = require("./routes/admin/likeswall");
const adminCommentRouter = require("./routes/admin/comment");
const adminLikesCommentRouter = require("./routes/admin/likescomment");
const app = express();
// 配置静态文件服务
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./dist")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 全局配置 CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // 允许的源域
    credentials: true, // 允许发送 cookies
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 允许的 HTTP 方法
    allowedHeaders: "Content-Type,Authorization", // 允许的请求头
  })
);
// 前台路由配置
app.use("/index", indexRouter);
app.use("/users", userAuth, usersRouter);
app.use("/search", searchRouter);
app.use("/auth", authRouter);
app.use("/email", emailRouter);
// 后台路由配置
// app.use("/admin/auth", adminAuthRouter);
app.use("/admin/article", adminArticleRouter);
app.use("/admin/photography", adminPhotographyRouter);
app.use("/admin/note", adminNoteRouter);
app.use("/admin/likes", adminLikesRouter);
app.use("/admin/uploadavatar", adminUploadAvatarRouter);
app.use("/admin/upload", adminUploadRouter);
app.use("/admin/feedback", adminFeedbackRouter);
app.use("/admin/update", adminUpdateRouter);
app.use("/admin/wall", adminWallRouter);
app.use("/admin/likeswall", adminLikesWallRouter);
app.use("/admin/comment", adminCommentRouter);
app.use("/admin/likescomment", adminLikesCommentRouter);
module.exports = app;
