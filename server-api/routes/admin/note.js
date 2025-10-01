const express = require("express");
const router = express.Router();
const { Note, User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const userAuth = require("../../middlewares/user-auth");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// 定义上传目录
const uploadDir = path.join(__dirname, "../../public/uploads");

// 查询所有笔记
router.get("/", userAuth, async (req, res) => {
  // 通过分页
  const query = req.query;
  const currentPage = Math.abs(Number(query.currentPage)) || 1;
  const pageSize = Math.min(Math.abs(Number(query.pageSize)) || 200, 200);
  const offset = (currentPage - 1) * pageSize;

  const condition = {
    order: [["id", "DESC"]],
    limit: pageSize,
    offset,
    include: [
      {
        model: User,
        attributes: ["id"],
      },
    ],
  }; // 添加 userId 过滤条件
  if (query.userId) {
    condition.where = {
      userId: query.userId,
    };
  }
  if (query.title) {
    condition.where = {
      title: {
        [Op.like]: `%${query.title}%`,
      },
    };
  }
  if (query.content) {
    condition.where = {
      content: {
        [Op.like]: `%${query.content}%`,
      },
    };
  }
  if (query.image) {
    condition.where = {
      image: {
        [Op.like]: `%${query.image}%`,
      },
    };
  }
  try {
    const { count, rows } = await Note.findAndCountAll(condition);
    success(res, "查询随笔随记成功", {
      notes: rows,
      pagination: {
        currentPage,
        pageSize,
        total: count,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
// 查询单个笔记
router.get("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "email", "username", "nickname", "avatar"], // 可以根据需要选择包含的用户字段
        },
      ],
    });
    if (!note) {
      return failure(res, 404, "单个随记随记不存在");
    }
    success(res, "查询单个随笔随记成功", {
      note,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 创建笔记
router.post("/", userAuth, async (req, res) => {
  try {
    const body = filterWhiteList(req);
    // 获取当前登录用户的 ID
    const userId = body.userId;
    // 将当前登录用户的 ID 赋值给 userId
    body.userId = userId;
    await Note.create(body);
    success(res, "创建随笔随记成功", {
      title: body.title,
      content: body.content,
      userId: body.userId,
      image: body.image,
      size: body.size,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 更新笔记
router.put("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);
    if (!note) {
      return failure(res, 404, "随笔随记不存在");
    }
    const body = filterWhiteList(req);
    await Note.update(body, { where: { id } });
    success(res, "更新随笔随记成功", {
      title: body.title,
      content: body.content,
      userId: body.userId,
      image: body.image,
      size: body.size,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 删除笔记
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);
    if (!note) {
      return failure(res, 404, "随笔随记不存在");
    }

    // 删除关联的图片文件（如果存在）
    if (note.image) {
      const imageName = note.image.split("/").pop();
      if (imageName) {
        const filePath = path.join(uploadDir, imageName);
        if (fs.existsSync(filePath)) {
          await promisify(fs.unlink)(filePath).catch((err) => {
            console.warn(`删除笔记图片文件失败: ${err.message}`);
          });
        }
      }
    }

    await note.destroy();
    success(res, "删除随笔随记成功");
  } catch (error) {
    failure(res, error);
  }
});
// 获取指定用户的笔记
router.get("/user/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await User.findOne({ where: { uuid } });
    if (!user) {
      throw new Error("用户不存在");
    }
    const userId = user.id;

    // 先检查是否有笔记，避免不必要的查询
    const noteCount = await Note.count({
      where: { userId },
    });

    // 如果没有笔记，直接返回空数组
    if (noteCount === 0) {
      return success(res, "暂无笔记列表", {
        notes: [],
      });
    }

    // 只有当存在笔记时才执行查询
    const notes = await Note.findAll({
      where: { userId: userId },
      attributes: [
        "id",
        "image",
        "title",
        "userId",
        "content",
        "createdAt",
        "updatedAt",
      ],
    });

    success(res, "查询指定用户随笔随记列表成功", {
      notes,
    });
  } catch (error) {
    failure(res, error);
  }
}); // 白名单过滤
function filterWhiteList(req) {
  return {
    title: req.body.title,
    content: req.body.content,
    userId: req.body.userId,
    image: req.body.image,
    size: req.body.size,
  };
}
module.exports = router;
