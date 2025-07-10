const express = require("express");
const router = express.Router();
const { Comment, LikesComment } = require("../../models");
const { success, failure } = require("../../utils/responses");

// 点赞评论
router.post("/like", async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    if (!commentId || !userId) {
      return failure(res, 400, "缺少参数");
    }
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return failure(res, 404, "评论不存在");
    }

    const existingLike = await LikesComment.findOne({
      where: { userId, commentId },
    });

    if (existingLike) {
      // 如果已经点赞，取消点赞
      await existingLike.destroy();
      await comment.update({
        likesCount: Math.max(0, comment.likesCount - 1),
      });
      return success(res, "取消点赞评论成功", {
        likeCount: comment.likesCount,
      });
    } else {
      // 如果没有点赞，添加点赞
      await LikesComment.create({ userId, commentId });
      await comment.update({
        likesCount: comment.likesCount + 1,
      });
      return success(res, "点赞评论成功", {
        likeCount: comment.likesCount,
      });
    }
  } catch (error) {
    console.error(error);
    return failure(res, "服务器错误");
  }
});

module.exports = router;
