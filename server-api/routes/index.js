const express = require("express");
const router = express.Router();
const { Article, Category, User } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * 查询文章数据
 */
router.get("/", async (req, res) => {
  try {
    // 推荐的文章
    const recommended = await Article.findAll({
      attributes: {
        exclude: ["CategoryId", "UserId", "content"],
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"], // 移除多余的逗号
        },
      ],
      where: { recommended: true },
      order: [["id", "desc"]],
      limit: 10, // 修正拼写错误
    });

    // 最新文章
    const likesArticle = await Article.findAll({
      attributes: {
        exclude: ["CategoryId", "UserId", "content"],
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "nickname", "avatar"],
        },
      ],
      order: [["id", "desc"]],
      limit: 10, // 修正拼写错误
    });

    success(res, "获取文章数据成功", { recommended, likesArticle });
  } catch (error) {
    failure(res, error);
  }
});

module.exports = router;
