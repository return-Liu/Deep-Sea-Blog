const express = require("express");
const router = express.Router();
const { User, Comment, Wall, Like, LikesWall } = require("../../models");
const { success, failure } = require("../../utils/responses");
// 获取指定留言墙的评论列表
router.get("/:wallId", async (req, res) => {
  try {
    const { wallId } = req.params;
    const comments = await Comment.findAll({
      where: {
        wallId: wallId,
      },
      include: [
        {
          model: User,
          attributes: ["nickname", "avatar", "area", "nicknameColor", "uuid"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      userId: comment.userId,
      username: comment.User.nickname,
      useravatar: comment.User.avatar,
      wallId: comment.wallId,
      likesCount: comment.likesCount,
      area: comment.User.area,
      commentbackground: comment.commentbackground,
      nicknameColor: comment.User.nicknameColor,
      uuid: comment.User.uuid,
    }));

    success(res, "获取评论列表成功", {
      comments: formattedComments,
    });
  } catch (error) {
    console.error("获取评论列表失败:", error);
    failure(res, error);
  }
});

// 创建评论
router.post("/:wallId", async (req, res) => {
  try {
    // 过滤白名单数据
    const body = filterWhiteList(req);
    const { wallId } = req.params;
    const { content, userId } = body;
    // 获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, "用户不存在");
    }

    const comment = await Comment.create({
      content,
      userId,
      username: user.nickname,
      useravatar: user.avatar,
      wallId,
      likesCount: 0,
      area: user.area,
      commentbackground: req.body.commentbackground,
    });

    success(res, "创建评论成功", comment);
  } catch (error) {
    failure(res, error);
  }
});
// 获取指定留言墙的评论数量
router.get("/count/:wallId", async (req, res) => {
  try {
    const { wallId } = req.params;
    const commentCount = await Comment.count({
      where: {
        wallId: wallId,
      },
    });

    success(res, "获取评论数量成功", {
      count: commentCount,
      wallId: wallId,
    });
  } catch (error) {
    console.error("获取评论数量失败:", error);
    failure(res, error);
  }
});
// 获取当前评论用户的所有信息
router.get("/user/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const user = await User.findOne({
      where: { uuid },
      attributes: [
        "nickname",
        "avatar",
        "area",
        "sex",
        "constellation",
        "introduce",
        "birthday",
        "uuid",
        "nicknameColor",
      ],
    });
    if (!user) {
      return failure(res, "用户不存在");
    }
    // 返回成功响应
    success(res, "获取用户评论信息成功", user);
  } catch (error) {
    console.error("获取当前评论用户信息失败:", error);
    failure(res, error);
  }
});
// 删除特定留言下的所有评论
router.delete("/comment/wall/:id", async (req, res) => {
  try {
    const wallId = req.params.id;

    // 删除该留言下的所有评论
    const commentsDeleted = await Comment.destroy({
      where: {
        wallId: wallId,
      },
    });

    if (commentsDeleted > 0) {
      success(res, "留言下的评论已全部删除", commentsDeleted);
    } else {
      failure(res, "该留言下没有评论或删除失败");
    }
  } catch (error) {
    console.error("删除评论失败:", error);
    failure(res, error);
  }
});
// 删除留言
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // 删除该留言下的所有评论
    const commentsDeleted = await Comment.destroy({
      where: {
        wallId: id,
      },
    });

    if (commentsDeleted > 0) {
      console.log(`Deleted ${commentsDeleted} comments for wall ID: ${id}`);
    } else {
      console.log(`No comments to delete for wall ID: ${id}`);
    }

    // 删除留言
    const wallDeleted = await Wall.destroy({
      where: {
        id: id,
      },
    });

    if (wallDeleted) {
      success(res, "留言及评论删除成功", wallDeleted);
    } else {
      failure(res, "删除留言失败，留言不存在");
    }
  } catch (error) {
    console.error("删除留言失败:", error);
    failure(res, error);
  }
});
// 删除评论
router.delete("/comment/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // 删除评论
    const commentDeleted = await Comment.destroy({
      where: {
        id: id,
      },
    });

    if (commentDeleted) {
      success(res, "评论删除成功", commentDeleted);
    } else {
      failure(res, "删除评论失败，评论不存在");
    }
  } catch (error) {
    console.error("删除评论失败:", error);
    failure(res, error);
  }
});
// 删除指定用户的所有评论
router.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    // 删除指定用户的所有评论
    const commentsDeleted = await Comment.destroy({
      where: {
        userId: userId,
      },
    });

    if (commentsDeleted > 0) {
      success(res, "用户的所有评论已删除", commentsDeleted);
    } else {
      failure(res, "该用户没有评论或删除失败");
    }
  } catch (error) {
    console.error("删除用户评论失败:", error);
    failure(res, error);
  }
});

// 修改白名单过滤
function filterWhiteList(req) {
  return {
    content: req.body.content,
    userId: req.body.userId,
    wallId: req.params.wallId,
    LikesCount: req.body.LikesCount,
    commentbackground: req.body.commentbackground,
  };
}
module.exports = router;
