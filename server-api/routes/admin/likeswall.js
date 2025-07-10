const express = require("express");
const router = express.Router();
const { Wall, LikesWall } = require("../../models");
const { success, failure } = require("../../utils/responses");

router.post("/like", async (req, res) => {
  try {
    const { wallsId, userId } = req.body;
    if (!wallsId || !userId) {
      return failure(res, 400, "缺少参数");
    }

    const wall = await Wall.findByPk(wallsId);
    if (!wall) {
      return failure(res, 404, "留言不存在");
    }

    // 检查是否已点赞
    const existingLike = await LikesWall.findOne({
      where: { userId, wallsId },
    });

    if (existingLike) {
      // 已点赞时返回当前点赞状态和点赞数
      return success(res, "你已经点过赞了", {
        isLiked: true,
        likeCount: wall.likesCount,
        status: false,
      });
    }

    // 添加点赞记录
    await LikesWall.create({ userId, wallsId });

    // 更新点赞数
    await wall.update({
      likesCount: wall.likesCount + 1,
    });

    // 成功点赞时返回新的点赞状态和点赞数
    return success(res, "点赞成功", {
      isLiked: true,
      likeCount: wall.likesCount,
      status: true,
    });
  } catch (error) {
    console.error("点赞处理出错:", error);
    return failure(error, "服务器错误");
  }
});

module.exports = router;
