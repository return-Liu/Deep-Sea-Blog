// app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const userAuth = require("./middlewares/user-auth");
const autoUnfreezeMiddleware = require("./middlewares/autoUnfreezeMiddleware");
const deviceTrackerMiddleware = require("./middlewares/deviceTrackerMiddleware");
const DeviceCleanupScheduler = require("./utils/deviceCleanupScheduler");
const AutoUnfreezeService = require("./utils/autoUnfreeze");

// 路由
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
const adminUploadPhotoRouter = require("./routes/admin/uploadphoto");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./dist")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(autoUnfreezeMiddleware);
app.use(deviceTrackerMiddleware);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "http://oss-cn-beijing.aliyuncs.com",
    ],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// 前台路由
app.use("/index", indexRouter);
app.use("/users", userAuth, usersRouter);
app.use("/search", searchRouter);
app.use("/auth", authRouter);
app.use("/email", emailRouter);
app.use("/theme", themeRouter);
app.use("/location", locationRouter);
app.use("/device", userAuth, deviceRouter);

// 后台路由
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
app.use("/admin/uploadphoto", adminUploadPhotoRouter);

module.exports = app;
