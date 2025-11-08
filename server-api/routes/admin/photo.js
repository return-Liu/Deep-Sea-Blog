const express = require("express");
const router = express.Router();
const { User, Photo } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { Op } = require("sequelize");
const userAuth = require("../../middlewares/user-auth");
// 查询照片墙列表
router.get("/", userAuth, async (req, res) => {
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
  //   添加过滤条件
  if (query.userId) {
    condition.where = {
      userId: query.userId,
    };
    if (query.title) {
      condition.where = {
        ...condition.where,
        title: { [Op.like]: `%${query.title}%` },
      };
    }
    if (query.category) {
      condition.where = {
        ...condition.where,
        category: { [Op.like]: `%${query.category}%` },
      };
    }
    if (query.size) {
      condition.where = {
        ...condition.where,
        size: { [Op.like]: `%${query.size}%` },
      };
    }
    if (query.description) {
      condition.where = {
        ...condition.where,
        description: { [Op.like]: `%${query.description}%` },
      };
    }
    if (query.photo) {
      condition.where = {
        ...condition.where,
        photo: { [Op.like]: `%${query.photo}%` },
      };
    }
  }
  try {
    const { count, rows } = await Photo.findAndCountAll(condition);
    success(res, "查询照片墙列表成功", {
      photos: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
// 创建照片墙列表
router.post("/", userAuth, async (req, res) => {
  const body = filterWhiteList(req);
  const userId = body.userId;
  body.userId = userId;
  try {
    await Photo.create(body);
    success(res, "创建照片墙成功", {
      userId: body.userId,
      title: body.title,
      category: body.category,
      size: body.size,
      photo: body.photo,
      description: body.description,
    });
  } catch (error) {
    console.error("创建照片墙失败:", error);
    res.status(500).json({ error: "创建照片墙失败" });
  }
});
// 更新照片
router.put("/:id", userAuth, async (req, res) => {
  const { id } = req.params;
  const body = filterWhiteList(req);

  try {
    const photo = await Photo.findByPk(id);
    if (!photo) {
      return failure(res, "照片不存在");
    }

    // 更新字段
    await photo.update(body);

    success(res, "更新照片成功", {
      id: photo.id,
      title: photo.title,
      category: photo.category,
      photo: photo.photo,
      description: photo.description,
      updatedAt: photo.updatedAt,
    });
  } catch (error) {
    console.error("更新照片失败:", error);
    failure(res, "更新失败，请稍后再试");
  }
});
// 删除照片墙
router.delete("/:id", userAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await Photo.findByPk(id);
    if (!photo) {
      return failure(res, "照片不存在");
    }
    await photo.destroy();
    success(res, "删除照片成功");
  } catch (error) {
    console.error("删除照片失败:", error);
  }
});
// 公共方法 白名单过滤
function filterWhiteList(req) {
  return {
    userId: req.body.userId,
    title: req.body.title,
    category: req.body.category,
    size: req.body.size,
    photo: req.body.photo,
    description: req.body.description,
  };
}
module.exports = router;
