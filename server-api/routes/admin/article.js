const express = require("express");
const router = express.Router();
const { Article, User, Like, sequelize } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { Op } = require("sequelize");
const userAuth = require("../../middlewares/user-auth");

// 查询文章列表
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
  };

  // 添加 userId 过滤条件
  if (query.userId) {
    condition.where = {
      userId: query.userId,
    };
  }

  // 添加其他查询条件
  if (query.image) {
    condition.where = {
      ...condition.where,
      image: { [Op.like]: `%${query.image}%` },
    };
  }
  if (query.title) {
    condition.where = {
      ...condition.where,
      title: {
        [Op.like]: `%${query.title}%`,
      },
    };
  }
  if (query.label) {
    condition.where = {
      ...condition.where,
      label: {
        [Op.like]: `%${query.label}%`,
      },
    };
  }
  if (query.content) {
    condition.where = {
      ...condition.where,
      content: {
        [Op.like]: `%${query.content}%`,
      },
    };
  }
  if (query.views) {
    condition.where = {
      ...condition.where,
      views: {
        [Op.like]: `%${query.views}%`,
      },
    };
  }

  // 查询文章列表
  try {
    const { count, rows } = await Article.findAndCountAll(condition);
    success(res, "查询博客文章列表成功", {
      articles: rows,
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

// 查询文章详情
router.get("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id"], // 可以根据需要选择包含的用户字段
        },
      ],
    });
    if (!article) {
      return failure(res, 404, "博客单个文章不存在");
    }
    success(res, "查询单个博客文章成功", {
      article,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 创建文章
router.post("/", userAuth, async (req, res) => {
  try {
    // 白名单过滤
    const body = filterWhiteList(req);
    // 获取当前登录用户的 ID
    const userId = body.userId;
    // 将当前登录用户的 ID 赋值给 userId
    body.userId = userId;
    await Article.create(body);
    success(res, "创建博客文章成功", {
      image: body.image,
      userId: body.userId,
      title: body.title,
      label: body.label,
      content: body.content,
      likesCount: body.likesCount,
      size: body.size,
      views: body.views,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 删除文章
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const articleId = req.params.id;
    // 先删除所有关联的点赞记录
    await Like.destroy({
      where: { articleId: articleId },
    });
    // 再删除文章本身
    const deleted = await Article.destroy({
      where: { id: articleId },
    });
    if (!deleted) {
      failure(res, 404, "博客文章不存在");
    }
    success(res, "博客文章及关联点赞记录已删除");
  } catch (error) {
    console.error(error);
    failure(res, 500, "服务器错误");
  }
});

// 更新文章
router.put("/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    // 白名单过滤
    const body = filterWhiteList(req);

    if (!article) {
      return failure(res, 404, "博客文章不存在");
    }

    // 提供 where 条件
    await Article.update(body, { where: { id } });
    success(res, "更新博客文章成功", {
      image: body.image,
      title: body.title,
      userId: body.userId,
      label: body.label,
      content: body.content,
      likesCount: body.likesCount,
      size: body.size,
      views: body.views,
    });
  } catch (error) {
    failure(res, error);
  }
});
router.post("/views/:id", userAuth, async (req, res) => {
  try {
    const articleId = req.params.id;
    await Article.update(
      { views: sequelize.literal("views + 1") },
      { where: { id: articleId } }
    );
    success(res, "浏览量更新成功");
  } catch (error) {
    failure(res, error);
  }
});
// 查询指定用户的文章列表
router.get("/user/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;

    // 先检查用户是否存在
    const user = await User.findOne({
      where: { uuid },
      attributes: ["id"], // 只获取需要的字段
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    // 直接使用sequelize的count方法检查是否有文章
    const articleCount = await Article.count({
      where: { userId: user.id },
    });

    // 如果没有文章，直接返回空数组，避免执行findAll查询
    if (articleCount === 0) {
      return success(res, "暂无文章列表", {
        articles: [],
      });
    }

    // 只有当存在文章时才执行查询
    const articles = await Article.findAll({
      where: { userId: user.id },
      attributes: [
        "id",
        "image",
        "title",
        "userId",
        "label",
        "content",
        "likesCount",
        "size",
        "views",
        "createdAt",
        "updatedAt",
      ],
    });

    success(res, "查询指定用户博客文章列表成功", {
      articles,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 公共方法 白名单过滤
function filterWhiteList(req) {
  return {
    image: req.body.image,
    title: req.body.title,
    userId: req.body.userId,
    label: req.body.label,
    content: req.body.content,
    likesCount: req.body.likesCount,
    size: req.body.size,
    views: req.body.views,
  };
}

module.exports = router;
