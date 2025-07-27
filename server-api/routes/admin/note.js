const express = require("express");
const router = express.Router();
const { Note, User } = require("../../models");
const { success, failure } = require("../../utils/responses");
// 查询所有笔记
router.get("/", async (req, res) => {
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
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Note.destroy({ where: { id } });
    success(res, "删除随笔随记成功");
  } catch (error) {
    failure(res, error);
  }
});
// 白名单过滤
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
