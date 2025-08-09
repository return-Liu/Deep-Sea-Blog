const express = require("express");
const router = express.Router();
const { User, Comment, Wall, Like, LikesWall } = require("../../models");
const { success, failure } = require("../../utils/responses");
const userAuth = require("../../middlewares/user-auth");

// 递归查询评论及其回复
const getCommentsWithReplies = async (wallId) => {
  // 定义递归包含函数
  const buildInclude = (depth = 0) => {
    if (depth > 5) return []; // 限制递归深度，防止无限递归

    return [
      {
        model: User,
        attributes: ["nickname", "avatar", "area", "nicknameColor", "uuid"],
      },
      {
        model: User,
        as: "ReplyToUser",
        attributes: ["nickname", "avatar", "nicknameColor", "uuid"],
        required: false,
      },
      {
        model: Comment,
        as: "replies", // 使用别名
        include: buildInclude(depth + 1), // 递归包含
      },
    ];
  };

  const comments = await Comment.findAll({
    where: {
      wallId: wallId,
      parentId: null, // 只获取顶级评论
    },
    include: buildInclude(),
    order: [["createdAt", "DESC"]],
  });

  return comments;
};

// 递归格式化评论数据
const formatCommentsWithReplies = (comments) => {
  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    userId: comment.userId,
    username: comment.User?.nickname,
    useravatar: comment.User?.avatar,
    wallId: comment.wallId,
    likesCount: comment.likesCount,
    area: comment.User?.area,
    commentbackground: comment.commentbackground,
    uuid: comment.User?.uuid,
    parentId: comment.parentId,
    nicknameColor: comment.User?.nicknameColor,
    replyToUser: comment.ReplyToUser
      ? {
          userId: comment.ReplyToUser.id,
          nickname: comment.ReplyToUser.nickname,
          avatar: comment.ReplyToUser.avatar,
          nicknameColor: comment.ReplyToUser.nicknameColor,
          uuid: comment.ReplyToUser.uuid,
        }
      : null,
    replies: comment.replies ? formatCommentsWithReplies(comment.replies) : [],
  }));
};

// 获取指定留言墙的评论列表
router.get("/:wallId", userAuth, async (req, res) => {
  try {
    const { wallId } = req.params;

    // 递归查询评论及其回复
    const comments = await getCommentsWithReplies(wallId);

    // 递归格式化评论数据
    const formattedComments = formatCommentsWithReplies(comments);

    success(res, "获取评论列表成功", {
      comments: formattedComments,
    });
  } catch (error) {
    console.error("获取评论列表失败:", error);
    failure(res, error);
  }
});

// 创建评论
router.post("/:wallId", userAuth, async (req, res) => {
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
router.get("/count/:wallId", userAuth, async (req, res) => {
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
router.get("/user/:uuid", userAuth, async (req, res) => {
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
router.delete("/comment/wall/:id", userAuth, async (req, res) => {
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
router.delete("/:id", userAuth, async (req, res) => {
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
router.delete("/comment/:id", userAuth, async (req, res) => {
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
router.delete("/user/:id", userAuth, async (req, res) => {
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

// 举报当前评论的信息
router.post("/reportUser", userAuth, async (req, res) => {});

// 举报访问用户详情页的信息
router.post("/reportUserDetail/:uuid", userAuth, async (req, res) => {
  try {
    const { uuid } = req.params;
  } catch (error) {
    failure(res, error);
  }
});

// 回复评论
router.post("/replyComment/:wallId", userAuth, async (req, res) => {
  try {
    const { wallId } = req.params;
    const { content, userId, parentId } = req.body;

    // 验证用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, "用户不存在");
    }

    // 验证父评论是否存在（如果是回复评论）
    let replyToUserId = null;
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return failure(res, "父评论不存在");
      }
      // 自动设置被回复的用户ID
      replyToUserId = parentComment.userId;
    }

    // 创建回复评论
    const replyComment = await Comment.create({
      content,
      userId,
      wallId,
      parentId: parentId || null,
      replyToUserId: replyToUserId, // 自动设置
      username: user.nickname,
      useravatar: user.avatar,
      likesCount: 0,
      area: user.area,
      commentbackground: req.body.commentbackground || null,
    });

    success(res, "回复评论成功", replyComment);
  } catch (error) {
    console.error("回复评论失败:", error);
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
