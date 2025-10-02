// user-controller.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { success, failure } = require("../utils/responses");
const { UnauthorizedError } = require("../utils/errors");

// 获取当前用户信息的函数
async function getCurrentUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("未提供身份验证令牌");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (!user) {
      throw new UnauthorizedError("用户不存在");
    }
    return user;
  } catch (err) {
    throw new UnauthorizedError("无效的身份验证令牌");
  }
}

class UserController {
  // 冻结用户接口
  static freezeUser = async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (currentUser.role !== "admin") {
        throw new UnauthorizedError("无权限执行此操作");
      }

      const { id } = req.params;
      const { reason, message, freezeType = "temporary", duration } = req.body; // duration 单位：小时

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        throw new NotFoundError("用户不存在");
      }

      // 计算解冻时间
      let unfreezeAt = null;
      if (freezeType === "temporary" && duration) {
        unfreezeAt = new Date(Date.now() + duration * 60 * 60 * 1000); // 小时转毫秒
      }
      // 如果是永久冻结，unfreezeAt 为 null

      await targetUser.update({
        isFrozen: true,
        frozenReason: reason,
        frozenAt: new Date(),
        unfreezeAt: unfreezeAt,
        freezeType: freezeType,
        frozenMessage: message,
      });

      success(res, "用户冻结成功", {
        userId: targetUser.id,
        freezeType,
        frozenAt: new Date(),
        unfreezeAt: unfreezeAt,
        duration: duration ? `${duration}小时` : "永久",
      });
    } catch (error) {
      failure(res, error);
    }
  };

  // 解冻用户
  static unfreezeUser = async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (currentUser.role !== "admin") {
        throw new UnauthorizedError("无权限执行此操作");
      }

      const { id } = req.params;

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        throw new NotFoundError("用户不存在");
      }

      await targetUser.update({
        isFrozen: false,
        frozenReason: null,
        frozenAt: null,
        unfreezeAt: null,
        freezeType: null,
        frozenMessage: null,
      });

      success(res, "用户解冻成功");
    } catch (error) {
      failure(res, error);
    }
  };

  // 获取用户冻结信息
  static async getFreezeInfo(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: "用户不存在" });
      }

      success(res, "获取冻结信息成功", {
        userId: user.id,
        isFrozen: user.isFrozen,
        frozenReason: user.frozenReason,
        frozenAt: user.frozenAt,
      });
    } catch (error) {
      console.error("获取冻结信息失败:", error);
      failure(res, "操作失败");
    }
  }

  // 获取用户冻结状态
  static async getFreezeStatus(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        throw new NotFoundError("用户不存在");
      }

      success(res, "获取冻结状态成功", {
        userId: user.id,
        isFrozen: user.isFrozen,
      });
    } catch (error) {
      failure(res, error);
    }
  }
}

module.exports = UserController;
