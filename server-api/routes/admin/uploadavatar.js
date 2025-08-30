const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { client } = require("../../utils/oss");

// 自定义请求头
const headers = {
  "x-oss-storage-class": "Standard",
  "x-oss-forbid-overwrite": "false",
};

// 配置 Multer 使用内存存储
const storage = multer.memoryStorage();

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

// 上传文件到OSS的函数
async function uploadToOSS(buffer, ossFileName) {
  try {
    const result = await client.put(ossFileName, buffer, { headers });
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// 从OSS删除文件
async function deleteFromOSS(ossFileName) {
  try {
    await client.delete(ossFileName);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

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

router.get("/avatar/sign", async (req, res) => {
  const { filename } = req.query;
  const url = await client.signatureUrl(`avatar/${filename}`, {
    method: "GET",
  });
  success(res, "获取签名URL成功", { url });
});

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

    // 从OSS删除旧头像
    if (user.avatar) {
      try {
        await deleteFromOSS(`avatar/${user.avatar}`);
      } catch (e) {
        console.log("删除旧头像失败:", e);
      }
    }

    // 生成新文件名
    const newFilename = `cropped_${Date.now()}${path.extname(
      req.file.originalname
    )}`;

    // 使用sharp处理图片 - 裁剪为正方形并调整大小
    const metadata = await sharp(req.file.buffer).metadata();
    const size = Math.min(metadata.width, metadata.height);

    // 处理图片并直接上传到OSS
    const processedImageBuffer = await sharp(req.file.buffer)
      .extract({
        left: Math.floor((metadata.width - size) / 2),
        top: Math.floor((metadata.height - size) / 2),
        width: size,
        height: size,
      })
      .resize(200, 200)
      .jpeg({ quality: 90 })
      .toBuffer();

    // 上传到OSS
    const ossFileName = `avatar/${newFilename}`;
    await uploadToOSS(processedImageBuffer, ossFileName);

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

    // 从OSS删除旧头像
    if (user.avatar) {
      try {
        await deleteFromOSS(`avatar/${user.avatar}`);
      } catch (e) {
        console.log("删除旧头像失败:", e);
      }
    }

    // 生成新文件名
    const newFilename = `${Date.now()}${path.extname(req.file.originalname)}`;

    // 上传到OSS
    const ossFileName = `avatar/${newFilename}`;
    await uploadToOSS(req.file.buffer, ossFileName);

    // 更新用户头像
    user.avatar = newFilename;
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

    // 从OSS删除文件
    await deleteFromOSS(`avatar/${filename}`);

    success(res, "删除头像成功");
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return failure(res, 404, "文件不存在");
    }
    console.error(`删除头像失败: ${error}`);
    failure(res, 500, "服务器内部错误");
  }
});

module.exports = router;
