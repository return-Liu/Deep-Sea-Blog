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
  LikesComment,
  Report,
  Feedback,
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
  const sequelize = require("../models").sequelize;
  const transaction = await sequelize.transaction();

  try {
    const user = await getCurrentUser(req);

    // 1. 检查账号状态
    if (user.isFrozen) {
      await transaction.rollback();
      return failure(res, new Error("账号已被冻结，无法注销"));
    }

    // 2. 检查是否有未完成的订单或其他重要业务（根据实际业务需求添加）

    // 3. 后端二次验证 - 检查请求中是否包含确认令牌
    const { confirmToken } = req.body;
    const expectedToken = `${user.id}_${Math.floor(Date.now() / 1000 / 60)}`; // 精确到分钟

    if (!confirmToken || confirmToken !== expectedToken) {
      await transaction.rollback();
      return failure(res, new Error("注销确认令牌无效或已过期"));
    }

    // 4. 清理用户点赞记录
    await Promise.all([
      LikesWall.destroy({ where: { userId: user.id }, transaction }),
      Like.destroy({ where: { userId: user.id }, transaction }),
      LikesComment.destroy({ where: { userId: user.id }, transaction }),
    ]);

    // 5. 更新被用户点赞过的内容的点赞计数
    const updateLikedCounts = async (Model, foreignKey) => {
      const likedItems = await Model.findAll({
        where: { userId: user.id },
        include: [{ model: Wall }],
        transaction,
      });

      for (const item of likedItems) {
        if (item.Wall) {
          await item.Wall.update(
            { likesCount: item.Wall.likesCount - 1 },
            { transaction }
          );
        }
      }
    };

    await updateLikedCounts(LikesWall, "wallsId");

    // 6. 删除用户发布的内容
    const [userArticles, userPhotographies, userNotes] = await Promise.all([
      Article.findAll({ where: { userId: user.id }, transaction }),
      Photography.findAll({ where: { userId: user.id }, transaction }),
      Note.findAll({ where: { userId: user.id }, transaction }),
    ]);

    await Promise.all([
      Article.destroy({ where: { userId: user.id }, transaction }),
      Photography.destroy({ where: { userId: user.id }, transaction }),
      Note.destroy({ where: { userId: user.id }, transaction }),
      Wall.destroy({ where: { userId: user.id }, transaction }),
    ]);

    // 7. 删除OSS上的相关图片文件
    const { deleteFromOSS } = require("../utils/oss");

    const deleteImages = async (items, key) => {
      for (const item of items) {
        if (item[key]) {
          try {
            await deleteFromOSS(item[key]);
          } catch (error) {
            console.error(`删除图片失败: ${item[key]}`, error);
          }
        }
      }
    };

    await Promise.all([
      deleteImages(userArticles, "image"),
      deleteImages(userPhotographies, "image"),
      deleteImages(userNotes, "image"),
    ]);

    // 8. 删除用户头像
    if (user.avatar && !user.avatar.includes("defaultAvatar")) {
      try {
        await deleteFromOSS(user.avatar);
      } catch (error) {
        console.error(`删除用户头像失败: ${user.avatar}`, error);
      }
    }

    // 9. 删除用户的设备信息
    await Device.destroy({ where: { userId: user.id }, transaction });

    // 10. 处理其他用户的关联评论
    await Comment.update(
      { replyToUserId: null },
      { where: { replyToUserId: user.id }, transaction }
    );

    await Comment.update(
      { parentId: null },
      { where: { parentId: user.id }, transaction }
    );

    // 11. 删除用户账号
    await user.destroy({ transaction });

    // 12. 提交事务
    await transaction.commit();

    success(res, "注销账号成功");
  } catch (error) {
    await transaction.rollback();
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
