const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/user-auth");
const {
  User,
  Article,
  Photography,
  Note,
  LikesWall,
  Like,
  Wall,
  Comment,
  Device,
} = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");
// 查询当前登录用户详情
router.get("/me", userAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    success(res, "查询当前用户信息成功", user);
  } catch (error) {
    failure(res, error);
  }
});

// 更新当前用户信息
router.put("/info", userAuth, async (req, res) => {
  try {
    const body = {
      nickname: req.body.nickname,
      avatar: req.body.avatar,
      introduce: req.body.introduce,
      birthday: req.body.birthday,
      sex: req.body.sex,
      constellation: req.body.constellation,
      nicknameColor: req.body.nicknameColor,
      area: req.body.area,
      username: req.body.username,
      phone: req.body.phone, // 新增手机号码字段
    };
    const user = await getCurrentUser(req);
    await user.update(body);
    success(res, "更新用户信息成功", user);
  } catch (error) {
    failure(res, error);
  }
});
// 注销账号
router.delete("/delete", userAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);

    // 1. 处理用户点赞过的留言
    const userLikedWalls = await LikesWall.findAll({
      where: { userId: user.id },
      include: [{ model: Wall }],
    });

    // 更新被用户点赞过的留言的点赞数
    for (const likedWall of userLikedWalls) {
      if (likedWall.Wall) {
        await likedWall.Wall.update({
          likesCount: likedWall.Wall.likesCount - 1,
        });
      }
    }

    // 2. 删除用户的点赞记录(留言)
    await LikesWall.destroy({
      where: { userId: user.id },
    });
    // 2.1 删除用户的点赞记录(文章)
    await Like.destroy({
      where: { userId: user.id },
    });

    // 2.2 删除用户评论的点赞记录
    const userComments = await Comment.findAll({
      where: { userId: user.id },
    });

    for (const comment of userComments) {
      await LikesComment.destroy({
        where: { commentId: comment.id },
      });
    }

    const userWalls = await Wall.findAll({
      where: { userId: user.id },
      include: [{ model: LikesWall }],
    });

    // 删除用户留言的所有点赞记录
    for (const wall of userWalls) {
      await LikesWall.destroy({
        where: { wallsId: wall.id },
      });
    }

    // 3. 处理用户发布的文章
    const userArticles = await Article.findAll({
      where: { userId: user.id },
      include: [{ model: Like }],
    });
    // 删除用户文章的所有点赞记录
    for (const article of userArticles) {
      await Like.destroy({
        where: { articleId: article.id },
      });
    }

    // 3.1 处理用户相关的反馈和举报
    await Report.destroy({
      where: { userId: user.id },
    });

    await Feedback.destroy({
      where: { userId: user.id },
    });

    // 删除用户的所有留言
    await Wall.destroy({
      where: { userId: user.id },
    });

    // 4. 删除用户其他内容
    // 获取用户的所有文章、摄影和笔记，以便后续删除OSS上的图片
    const [userAllArticles, userAllPhotographies, userAllNotes] =
      await Promise.all([
        Article.findAll({ where: { userId: user.id } }),
        Photography.findAll({ where: { userId: user.id } }),
        Note.findAll({ where: { userId: user.id } }),
      ]);

    await Article.destroy({
      where: { userId: user.id },
    });

    await Photography.destroy({
      where: { userId: user.id },
    });

    await Note.destroy({
      where: { userId: user.id },
    });

    // 删除OSS上的相关图片文件
    const { deleteFromOSS } = require("../utils/oss");

    // 删除文章中的图片
    for (const article of userAllArticles) {
      if (article.image) {
        try {
          await deleteFromOSS(article.image);
        } catch (error) {
          console.error(`删除文章图片失败: ${article.image}`, error);
        }
      }
    }

    // 删除摄影中的图片
    for (const photography of userAllPhotographies) {
      if (photography.image) {
        try {
          await deleteFromOSS(photography.image);
        } catch (error) {
          console.error(`删除摄影图片失败: ${photography.image}`, error);
        }
      }
    }

    // 删除笔记中的图片
    for (const note of userAllNotes) {
      if (note.image) {
        try {
          await deleteFromOSS(note.image);
        } catch (error) {
          console.error(`删除笔记图片失败: ${note.image}`, error);
        }
      }
    }

    // 删除用户的所有评论
    await Comment.destroy({
      where: { userId: user.id },
    });

    await Comment.update(
      { replyToUserId: null },
      { where: { replyToUserId: user.id } }
    );

    await Device.destroy({
      where: { userId: user.id },
    });

    // 5. 最后删除用户账号
    await user.destroy();

    success(res, "注销账号成功");
  } catch (error) {
    failure(res, error);
  }
});
// 公共方法 查询当前用户
async function getCurrentUser(req, showPassword = false) {
  const id = req.userId;
  let condition = {};
  if (!showPassword) {
    condition = {
      attributes: {
        exclude: ["password"],
      },
    };
  }
  const user = await User.findByPk(id, condition);
  if (!user) {
    throw new NotFoundError("当前用户不存在");
  }
  return user;
}

module.exports = router;
