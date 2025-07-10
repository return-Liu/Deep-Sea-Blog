const express = require("express");
const router = express.Router();
const { Article, Like } = require("../../models");
const { success, failure } = require("../../utils/responses");

// 点赞文章
router.post("/like", async (req, res) => {
  try {
    const { articleId, userId } = req.body;

    if (!articleId || !userId) {
      return failure(res, 400, "缺少参数");
    }
    const article = await Article.findByPk(articleId);

    if (!article) {
      return failure(res, 404, "文章不存在");
    }

    const existingLike = await Like.findOne({
      where: { userId, articleId },
    });

    if (existingLike) {
      // 如果已经点赞，取消点赞
      await existingLike.destroy();
      await article.update({
        likesCount: Math.max(0, article.likesCount - 1),
      });
      return success(res, "取消点赞成功", {
        likeCount: article.likesCount,
      });
    } else {
      // 如果没有点赞，添加点赞
      await Like.create({ userId, articleId });
      await article.update({
        likesCount: article.likesCount + 1,
      });
      return success(res, "点赞成功,可以查看点赞列表了", {
        likeCount: article.likesCount,
      });
    }
  } catch (error) {
    console.error(error);
    return failure(res, "服务器错误");
  }
});

module.exports = router;
