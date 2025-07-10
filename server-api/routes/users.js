const express = require("express");
const router = express.Router();
const {
  User,
  Article,
  Photography,
  Note,
  LikesWall,
  Like,
  Wall,
} = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFoundError } = require("../utils/errors");
// 查询当前登录用户详情
router.get("/me", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    success(res, "查询当前用户信息成功", user);
  } catch (error) {
    failure(res, error);
  }
});

// 更新当前用户信息
router.put("/info", async (req, res) => {
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
router.delete("/delete", async (req, res) => {
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

    // 3.1 处理用户发布的文章
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

    // 删除用户的所有留言
    await Wall.destroy({
      where: { userId: user.id },
    });

    // 4. 删除用户其他内容
    await Article.destroy({
      where: { userId: user.id },
    });

    await Photography.destroy({
      where: { userId: user.id },
    });

    await Note.destroy({
      where: { userId: user.id },
    });

    // 5. 最后删除用户账号
    await user.destroy();

    success(res, "注销账号成功");
  } catch (error) {
    failure(res, error);
  }
});
// 删除用户资源
router.delete("/resources", async (req, res) => {
  try {
    const userId = req.body.userId;

    // 删除用户的文章
    await Article.destroy({
      where: {
        userId: userId,
      },
    });

    // 删除用户的摄影
    await Photography.destroy({
      where: {
        userId: userId,
      },
    });

    // 删除用户的随记
    await Note.destroy({
      where: {
        userId: userId,
      },
    });

    success(res, "删除用户资源成功");
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
