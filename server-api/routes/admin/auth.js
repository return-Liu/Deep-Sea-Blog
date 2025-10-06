const express = require("express");
const router = express.Router();
const userAuth = require("../../middlewares/user-auth");
const adminAuth = require("../../middlewares/admin-auth");
const { User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { NotFoundError, BadRequestError } = require("../../utils/errors");
const { Op } = require("sequelize");

// 冻结用户接口（管理员权限）
router.post("/freeze", userAuth, adminAuth, async (req, res) => {
  try {
    const { username, reason, freezeType, durationDays } = req.body;

    if (!username || !reason || !freezeType) {
      return failure(
        res,
        new BadRequestError("用户名、冻结原因和冻结类型不能为空")
      );
    }

    if (freezeType !== "temporary" && freezeType !== "permanent") {
      return failure(
        res,
        new BadRequestError("冻结类型必须是 temporary 或 permanent")
      );
    }

    if (freezeType === "temporary" && (!durationDays || durationDays <= 0)) {
      return failure(
        res,
        new BadRequestError("临时冻结必须提供有效的冻结天数")
      );
    }

    // 通过用户名查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return failure(res, new NotFoundError("用户不存在"));
    }

    // 计算解冻时间（如果是临时冻结）
    let unfreezeAt = null;
    let frozenMessage = "";

    if (freezeType === "temporary") {
      unfreezeAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      frozenMessage = `您的账户因以下原因被临时冻结：${reason}。冻结期限：${durationDays}天，预计解冻时间：${unfreezeAt.toLocaleString()}。`;
    } else {
      frozenMessage = `您的账户因以下原因被永久冻结：${reason}。如有疑问请联系客服。`;
    }

    // 冻结用户
    await user.update({
      isFrozen: 1,
      frozenReason: reason,
      frozenAt: new Date(),
      frozenBy: req.user.id,
      freezeType: freezeType,
      unfreezeAt: unfreezeAt,
      frozenMessage: frozenMessage,
    });

    const responseData = {
      userId: user.id,
      username: user.username,
      isFrozen: 1,
      frozenReason: reason,
      frozenAt: new Date(),
      freezeType: freezeType,
      unfreezeAt: unfreezeAt,
    };

    if (freezeType === "temporary") {
      responseData.durationDays = durationDays;
    }

    return success(
      res,
      `用户已${freezeType === "temporary" ? "临时" : "永久"}冻结`,
      responseData
    );
  } catch (error) {
    failure(res, error);
  }
});

// 解冻用户接口（管理员权限）
router.post("/unfreeze", userAuth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return failure(res, new BadRequestError("用户ID不能为空"));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return failure(res, new NotFoundError("用户不存在"));
    }

    // 解冻用户
    await user.update({
      isFrozen: 0,
      frozenReason: null,
      frozenAt: null,
      unfreezeAt: null,
      freezeType: null,
      frozenMessage: null,
      frozenBy: null,
    });

    return success(res, "用户已解冻", {
      userId: user.id,
      username: user.username,
      isFrozen: 0,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 获取冻结用户列表
router.get("/freeze/list", userAuth, adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where: { isFrozen: 1 },
      limit,
      offset,
    });
    return success(res, "获取冻结用户列表成功", {
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      users: rows,
    });
  } catch (error) {
    failure(res, error);
  }
});

// 根据用户名搜索用户（管理员权限）
router.get("/search/:username", userAuth, adminAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // 添加参数验证
    if (!username || username.trim().length === 0) {
      return failure(res, "用户名不能为空", 400);
    }

    // 限制搜索长度，防止过长的搜索
    if (username.length > 50) {
      return failure(res, "搜索关键词过长", 400);
    }

    const users = await User.findAll({
      where: {
        username: {
          [Op.like]: `%${username.trim()}%`,
        },
      },
      // 添加字段选择
      attributes: [
        "id",
        "username",
        "email",
        "createdAt",
        "isFrozen",
        "area",
        "birthday",
        "clientFeatureCode",
        "constellation",
        "frozenReason",
        "frozenAt",
        "unfreezeAt",
        "freezeType",
        "frozenMessage",
        "introduce",
        "nickname",
        "nicknameColor",
        "phone",
        "role",
        "sex",
        "theme",
        "updatedAt",
        "uuid",
      ],
      limit: 50, // 限制返回数量
      order: [["username", "ASC"]], // 按用户名排序
    });

    return success(res, "搜索用户成功", {
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("搜索用户失败:", error);
    failure(res, "搜索用户失败");
  }
});

module.exports = router;
