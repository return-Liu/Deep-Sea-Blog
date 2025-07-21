const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

// 确保上传目录存在
const uploadDir = path.join(__dirname, "../../public/image");
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
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });

// 上传头像
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);

    // 验证用户是否存在
    if (!user) {
      return failure(res, 404, "用户不存在");
    }

    // 确保文件已成功上传
    if (!req.file) {
      return failure(res, 400, "未上传文件");
    }

    // 更新用户上传的图片
    user.image = req.file.filename;
    await user.save();
    success(res, "图片上传成功", {
      image: user.image,
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return failure(res, 400, "文件大小超过限制（5MB）");
      }
    }
    failure(res, 500, "服务器内部错误");
  }
});

// 删除图片文件
function isValidFilename(filename) {
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}

router.delete("/image/:filename", async (req, res) => {
  const { filename } = req.params;
  const userId = req.userId; // 假设通过 JWT 获取用户 ID

  if (!isValidFilename(filename)) {
    return failure(res, 400, "无效的文件名");
  }

  const filePath = path.join(uploadDir, filename);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    return failure(res, 404, "文件不存在");
  }

  // 检查文件是否属于当前用户（需结合数据库）
  const fileRecord = await FileModel.findOne({
    where: { filename, userId },
  });

  if (!fileRecord) {
    return failure(res, 403, "无权删除此文件");
  }

  try {
    await promisify(fs.unlink)(filePath);
    await fileRecord.destroy(); // 同时删除数据库记录
    success(res, "删除图片成功");
  } catch (error) {
    console.error("删除图片失败:", error);
    failure(res, 500, "服务器内部错误");
  }
});

module.exports = router;
