// 核心模块
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// 加载环境变量
require("dotenv").config();

// 自定义中间件和服务
const userAuth = require("./middlewares/user-auth");
const autoUnfreezeMiddleware = require("./middlewares/autoUnfreezeMiddleware");
const deviceTrackerMiddleware = require("./middlewares/deviceTrackerMiddleware");
const DeviceCleanupScheduler = require("./utils/deviceCleanupScheduler");
const AutoUnfreezeService = require("./utils/autoUnfreeze");

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

// 初始化应用
const app = express();

// 静态文件服务与中间件配置
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./dist")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(autoUnfreezeMiddleware);
app.use(deviceTrackerMiddleware);

// 全局 CORS 配置
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

// WebSocket 配置
const { createServer } = require("http");
const WebSocket = require("ws");
const server = createServer(app);
const wss = new WebSocket.Server({ server, path: "/websocket" });

// 封装 WebSocket 逻辑
function setupWebSocket(wss) {
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://localhost:4173",
  ]);

  wss.on("connection", (ws, req) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      console.warn("拒绝不受信任的 origin:", origin);
      try {
        ws.close(1008, "Origin not allowed");
      } catch (e) {
        /* ignore */
      }
      return;
    }

    console.log("用户已连接", req.socket.remoteAddress || "unknown");

    ws.on("message", (message) => {
      console.log(
        "接收到原始消息:",
        typeof message === "string" ? message : "<binary>"
      );
      try {
        const data = JSON.parse(message);
        console.log("解析后的消息:", data);

        // 简单防护：只广播白名单字段，并限制内容长度
        const out = {
          type: data.type || "message",
          payload: null,
        };

        if (data.payload) {
          if (typeof data.payload === "string") {
            out.payload = data.payload.slice(0, 10000);
          } else if (data.payload.text) {
            out.payload = { text: String(data.payload.text).slice(0, 10000) };
          } else {
            out.payload = { raw: String(data.payload).slice(0, 10000) };
          }
        }

        const outStr = JSON.stringify(out);

        // 广播给除发送者外的所有客户端
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            try {
              client.send(outStr);
            } catch (e) {
              console.error("发送到 client 失败", e);
            }
          }
        });
      } catch (err) {
        console.error("解析消息错误:", err);
        try {
          ws.send(JSON.stringify({ type: "error", message: "消息格式错误" }));
        } catch (e) {
          /* ignore */
        }
      }
    });

    ws.on("error", (err) => {
      console.error("ws client error:", err);
    });

    ws.on("close", (code, reason) => {
      console.log("用户已断开连接", code, reason && reason.toString());
    });
  });

  wss.on("error", (err) => {
    console.error("wss error:", err);
  });
}

// 启动 WebSocket
setupWebSocket(wss);

// 启动定时任务
DeviceCleanupScheduler.start(); // 清理未登录设备
AutoUnfreezeService.start();

// 启动服务器
server.listen(3001, () => {
  console.log("WebSocket 服务已启动: ws://localhost:3001/websocket");
});

module.exports = app;
