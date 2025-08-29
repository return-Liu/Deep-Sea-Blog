const express = require("express");
const router = express.Router();
const { User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const multer = require("multer");
const path = require("path");
const userAuth = require("../../middlewares/user-auth");
const { client } = require("../../utils/oss");

// 自定义请求头
const headers = {
  "x-oss-storage-class": "Standard",
  "x-oss-forbid-overwrite": "false",
};

// 上传文件到OSS的函数 - 修改为直接使用buffer
async function uploadToOSS(fileBuffer, ossFileName) {
  try {
    const result = await client.put(
      ossFileName, // OSS上的文件路径和名称
      fileBuffer, // 直接使用文件buffer
      { headers } // 自定义headers
    );
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

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

// 文件大小限制（例如 5MB）
const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });
// 获取图片签名URL
router.get("/image/sign", async (req, res) => {
  try {
    const { filename } = req.query;
    // 确保只使用文件名，而不是完整路径
    const url = await client.signatureUrl(`images/${filename}`, {
      method: "GET",
      expires: 32400,
    });
    success(res, "获取签名URL成功", { url });
  } catch (error) {
    console.error("获取签名URL失败:", error);
    failure(res, 500, "获取签名URL失败");
  }
});
// 上传图片
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

    // 生成OSS文件名
    const ext = path.extname(req.file.originalname);
    const ossFileName = `images/${Date.now()}${ext}`;

    // 直接从内存上传到OSS
    await uploadToOSS(req.file.buffer, ossFileName);

    // 更新用户上传的图片（保存OSS路径）
    user.image = ossFileName;
    await user.save();

    success(res, "图片上传成功", {
      image: ossFileName,
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return failure(res, 400, "文件大小超过限制（5MB）");
      }
    }
    console.error("上传失败:", error);
    failure(res, 500, "服务器内部错误");
  }
});

router.delete("/image/:filename", userAuth, async (req, res) => {
  try {
    const { filename } = req.params;

    // 从OSS删除文件
    await client.delete(`images/${filename}`);

    success(res, "删除图片成功");
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return failure(res, 404, "文件不存在");
    }
    console.error(`删除图片失败: ${error}`);
    failure(res, 500, "服务器内部错误");
  }
});
router.delete("/user/:id", userAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    // 应该验证是否是当前用户或具有管理员权限
    if (req.user.id !== parseInt(userId) && req.user.role !== "admin") {
      return failure(res, 403, "无权限执行此操作");
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return failure(res, 404, "用户不存在");
    }

    // 删除用户在 OSS 中的所有图片资源
    if (user.image) {
      try {
        await client.delete(user.image);
      } catch (ossError) {
        console.error("删除用户图片失败:", ossError);
      }
    }

    // 删除用户数据
    await user.destroy();

    success(res, "用户删除成功"); // 修改为正确的信息
  } catch (error) {
    console.error("删除用户失败:", error);
    failure(res, 500, "删除用户失败");
  }
});
module.exports = router;
