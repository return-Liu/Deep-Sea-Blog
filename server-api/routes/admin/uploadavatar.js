const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const sharp = require("sharp");

// 确保上传目录存在
const uploadDir = path.join(__dirname, "../../public/avatar");
const mkdir = promisify(fs.mkdir);

async function ensureDirectoryExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    console.error("无法创建目录:", error);
    throw error;
  }
}

ensureDirectoryExists(uploadDir).catch((error) => {
  console.error("初始化上传目录失败:", error);
  process.exit(1); // 如果目录创建失败，退出应用
});

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// 设置文件过滤器，只允许上传图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片文件"), false);
  }
};

// 文件大小限制（例如 2MB）
const limits = {
  fileSize: 2 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });
// 添加用户头像更换频率限制Map
const avatarChangeLimiter = new Map();

// 清理过期的限制记录（可选）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of avatarChangeLimiter.entries()) {
    // 如果超过60秒，则清除记录
    if (now - value.timestamp > 60000) {
      avatarChangeLimiter.delete(key);
    }
  }
}, 30000); // 每30秒清理一次

// 裁剪头像 - 添加频率限制
router.post("/cropAvatar", upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return failure(res, 400, "用户ID不能为空");
    }

    if (!req.file) {
      return failure(res, 400, "未上传文件");
    }

    // 检查用户是否在限制时间内
    const userLimitKey = `user_${userId}`;
    const userLimit = avatarChangeLimiter.get(userLimitKey);
    const now = Date.now();

    // 如果用户在10秒内重复操作，则拒绝请求
    if (userLimit && now - userLimit.timestamp < 10000) {
      return failure(res, 429, "操作过于频繁，请稍后再试");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, 404, "用户不存在");
    }

    // 删除旧头像
    if (user.avatar) {
      const oldPath = path.join(uploadDir, user.avatar);
      if (fs.existsSync(oldPath)) {
        await fs.promises.unlink(oldPath);
      }
    }

    // 生成新文件名
    const newFilename = `cropped_${Date.now()}${path.extname(
      req.file.originalname
    )}`;
    const newPath = path.join(uploadDir, newFilename);

    // 使用sharp处理图片 - 裁剪为正方形并调整大小
    const metadata = await sharp(req.file.path).metadata();
    const size = Math.min(metadata.width, metadata.height);

    await sharp(req.file.path)
      .extract({
        left: Math.floor((metadata.width - size) / 2),
        top: Math.floor((metadata.height - size) / 2),
        width: size,
        height: size,
      })
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toFile(newPath);

    // 删除临时文件
    await fs.promises.unlink(req.file.path);

    // 更新用户记录
    user.avatar = newFilename;
    await user.save();

    // 记录用户操作时间
    avatarChangeLimiter.set(userLimitKey, {
      timestamp: now,
    });

    success(res, "头像裁剪成功", {
      avatar: newFilename,
    });
  } catch (error) {
    console.error("裁剪错误:", error);

    // 清理可能创建的文件
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }

    failure(res, 500, "头像裁剪失败");
  }
});

// 上传头像 - 同样添加频率限制
router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.body;

    // 检查用户是否在限制时间内
    const userLimitKey = `user_${userId}`;
    const userLimit = avatarChangeLimiter.get(userLimitKey);
    const now = Date.now();

    // 如果用户在10秒内重复操作，则拒绝请求
    if (userLimit && now - userLimit.timestamp < 10000) {
      return failure(res, 429, "操作过于频繁，请稍后再试");
    }

    const user = await User.findByPk(userId);

    // 验证用户是否存在
    if (!user) {
      return failure(res, 404, "用户不存在");
    }

    // 确保文件已成功上传
    if (!req.file) {
      return failure(res, 400, "未上传文件");
    }

    // 删除旧头像文件
    if (user.avatar) {
      const oldAvatarPath = path.join(uploadDir, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        await promisify(fs.unlink)(oldAvatarPath);
      }
    }

    // 更新用户头像
    user.avatar = req.file.filename;
    await user.save();

    // 记录用户操作时间
    avatarChangeLimiter.set(userLimitKey, {
      timestamp: now,
    });

    success(res, "头像上传成功", {
      avatar: user.avatar,
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return failure(res, 400, "文件大小超过限制（2MB）");
      }
    }
    failure(res, 500, "服务器内部错误");
  }
});
// 删除图片文件
router.delete("/avatar/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return failure(res, 404, "文件不存在");
    }

    // 删除文件
    await promisify(fs.unlink)(filePath);
    success(res, "删除头像成功");
  } catch (error) {
    console.error(`删除头像失败: ${error}`);
    failure(res, 500, "服务器内部错误");
  }
});
// 检查头像是否存在文件夹
router.get("/avatar/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // 如果文件不存在，返回默认头像
    if (!fs.existsSync(filePath)) {
      const defaultAvatarPath = path.join(
        uploadDir,
        "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
      ); // 默认头像路径
      if (fs.existsSync(defaultAvatarPath)) {
        const defaultFile = await promisify(fs.readFile)(defaultAvatarPath);
        return success(res, "使用默认头像", defaultFile);
      } else {
        return failure(res, 404, "默认头像也不存在");
      }
    }

    // 正常读取头像
    const file = await promisify(fs.readFile)(filePath);
    success(res, "获取头像成功", file);
  } catch (error) {
    console.error(`读取文件失败: ${error}`);
    failure(res, 500, "服务器内部错误");
  }
});

module.exports = router;
