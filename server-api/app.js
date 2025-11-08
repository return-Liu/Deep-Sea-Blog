const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors"); // 引入 cors 中间件
const userAuth = require("./middlewares/user-auth");
const AutoUnfreezeService = require("./utils/autoUnfreeze");
const deviceTrackerMiddleware = require("./middlewares/deviceTrackerMiddleware");
const DeviceCleanupScheduler = require("./utils/deviceCleanupScheduler");
const { createServer } = require("http");
const WebSocket = require("ws");

// 启动定时任务
DeviceCleanupScheduler.start(); // 清理未登录设备
AutoUnfreezeService.start();
const autoUnfreezeMiddleware = require("./middlewares/autoUnfreezeMiddleware");
require("dotenv").config();
// 前台路由
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const searchRouter = require("./routes/search");
const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email");
const themeRouter = require("./routes/theme");
const locationRouter = require("./routes/location");
const deviceRouter = require("./routes/device");
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
const adminAuthRouter = require("./routes/admin/auth");
const adminPhotoRouter = require("./routes/admin/photo");
const app = express();
// 配置静态文件服务
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./dist")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(autoUnfreezeMiddleware);
app.use(deviceTrackerMiddleware);
const server = createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("用户已连接");

  // 处理消息
  ws.on("message", (message) => {
    console.log("接收到原始消息:", message);

    try {
      const data = JSON.parse(message);
      console.log("解析后的消息:", data);

      // 广播给除发送者外的所有客户端
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("解析消息错误:", err);
    }
  });

  // 处理断开连接
  ws.on("close", () => {
    console.log("用户已断开连接");
  });
});
server.listen(3001, () => {
  console.log("WebSocket 服务已启动");
});
// 全局配置 CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://oss-cn-beijing.aliyuncs.com",
    ], // 允许的源域
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
app.use("/theme", themeRouter);
app.use("/location", locationRouter);
app.use("/device", userAuth, deviceRouter);

// 后台路由配置
app.use("/admin/article", userAuth, adminArticleRouter);
app.use("/admin/photography", userAuth, adminPhotographyRouter);
app.use("/admin/note", userAuth, adminNoteRouter);
app.use("/admin/likes", userAuth, adminLikesRouter);
app.use("/admin/uploadavatar", userAuth, adminUploadAvatarRouter);
app.use("/admin/upload", adminUploadRouter);
app.use("/admin/feedback", userAuth, adminFeedbackRouter);
app.use("/admin/update", adminUpdateRouter);
app.use("/admin/wall", userAuth, adminWallRouter);
app.use("/admin/likeswall", userAuth, adminLikesWallRouter);
app.use("/admin/comment", userAuth, adminCommentRouter);
app.use("/admin/likescomment", userAuth, adminLikesCommentRouter);
app.use("/admin/auth", userAuth, adminAuthRouter);
app.use("/admin/photo", userAuth, adminPhotoRouter);
module.exports = app;
