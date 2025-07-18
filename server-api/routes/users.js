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
  // 使用事务代理
  const transaction = await sequelize.transaction();
  try {
    const user = await getCurrentUser(req, true);

    // 1. 删除点赞记录
    await LikesWall.destroy({ where: { userId: user.id }, transaction });
    await Like.destroy({ where: { userId: user.id }, transaction });

    // 2. 删除留言及关联点赞
    const walls = await Wall.findAll({
      where: { userId: user.id },
      transaction,
    });
    const wallIds = walls.map((w) => w.id);
    if (wallIds.length > 0) {
      await LikesWall.destroy({ where: { wallsId: wallIds }, transaction });
    }
    await Wall.destroy({ where: { userId: user.id }, transaction });

    // 3. 删除内容
    await Article.destroy({ where: { userId: user.id }, transaction });
    await Photography.destroy({ where: { userId: user.id }, transaction });
    await Note.destroy({ where: { userId: user.id }, transaction });

    // 4. 删除用户
    await user.destroy({ transaction });

    await transaction.commit();
    success(res, "注销账号成功");
  } catch (error) {
    await transaction.rollback();
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
// 检查用户资源是否有
router.get("/resources/exist", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return failure(res, new Error("缺少用户ID"));
    }

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError("用户不存在");
    }

    // 检查用户是否有资源
    const hasArticles = (await Article.count({ where: { userId } })) > 0;
    const hasPhotography = (await Photography.count({ where: { userId } })) > 0;
    const hasNotes = (await Note.count({ where: { userId } })) > 0;

    const hasResources = hasArticles || hasPhotography || hasNotes;

    success(res, "检查用户资源成功", {
      exist: hasResources,
      resources: {
        articles: hasArticles,
        photography: hasPhotography,
        notes: hasNotes,
      },
    });
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
