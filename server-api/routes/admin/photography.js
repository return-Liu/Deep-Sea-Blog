const express = require("express");
const router = express.Router();
const { Photography, User } = require("../../models");
const { success, failure } = require("../../utils/responses");

// 查询摄影作品
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
  };
  // 添加 userId 过滤条件
  if (query.userId) {
    condition.where = {
      userId: query.userId,
    };
  }
  if (query.image) {
    condition.where = {
      image: {
        [Op.like]: `%${query.image}%`,
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
  try {
    const { count, rows } = await Photography.findAndCountAll(condition);
    success(res, "查询摄影列表成功", {
      photography: rows,
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

// 查询单个摄影作品
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photography = await Photography.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "email", "username", "nickname", "avatar"], // 可以根据需要选择包含的用户字段
        },
      ],
    });
    if (!photography) {
      throw new Error("单个摄影作品不存在");
    }
    success(res, "查询单个摄影作品成功", {
      photography,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 创建摄影作品
router.post("/", async (req, res) => {
  try {
    const body = filterWhiteList(req);
    // 获取当前登录用户的 ID
    const userId = body.userId; // 从请求体中获取 userId
    // 将当前登录用户的 ID 赋值给 userId
    body.userId = userId;
    await Photography.create(body);
    success(res, "创建摄影作品成功", {
      image: body.image,
      userId: body.userId,
      size: body.size,
      content: body.content,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 更新摄影作品
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photography = await Photography.findByPk(id);
    if (!photography) {
      throw new Error("摄影作品不存在");
    }
    const body = filterWhiteList(req);
    await Photography.update(body, { where: { id } });
    success(res, "更新摄影作品成功", {
      image: body.image,
      userId: body.userId,
      size: body.size,
      content: body.content,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 删除摄影作品
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photography = await Photography.findByPk(id);
    if (!photography) {
      throw new Error("摄影作品不存在");
    }
    await photography.destroy();
    success(res, "删除摄影作品成功", {
      image: photography.image,
      content: photography.content,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 公共方法 过滤白名单
function filterWhiteList(req) {
  return {
    image: req.body.image,
    userId: req.body.userId,
    size: req.body.size,
    content: req.body.content,
  };
}

module.exports = router;
