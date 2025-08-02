const express = require("express");
const router = express.Router();
const { Update, User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { Op } = require("sequelize"); // 确保引入 Op

// 查询更新后台信息
router.get("/", async (req, res) => {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;
    const condition = {
      order: [["id", "DESC"]],
      limit: pageSize,
      offset,
      include: [
        {
          model: User,
          attributes: ["id"],
        },
      ],
    };

    if (query.title) {
      if (!condition.where) condition.where = {};
      condition.where.title = { [Op.like]: `%${query.title}%` };
    }

    if (query.content) {
      if (!condition.where) condition.where = {};
      condition.where.content = { [Op.like]: `%${query.content}%` };
    }

    console.log("Query condition:", condition); // 调试日志

    const { rows, count } = await Update.findAndCountAll(condition);
    success(res, "查询更新信息成功", {
      updates: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error querying updates:", error); // 记录错误日志
    failure(res, "查询更新信息失败", error);
  }
});
// 创建更新后台信息
router.post("/", async (req, res) => {
  try {
    // 白名单过滤
    const body = filterWhiteList(req);
    // 获取当前登录用户的 ID
    const userId = body.userId;

    // 验证 userId 是否为 4
    if (userId !== 4) {
      return failure(res, "只有 userId 为 4 的用户才能新增后台信息", {
        userId,
      });
    }

    // 将 userId 设置为当前用户的 id
    body.userId = userId;

    await Update.create(body);
    success(res, "创建更新信息成功", {
      title: body.title,
      userId: body.userId,
      content: body.content,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 单个查询
router.get("/:id", async (req, res) => {
  try {
    const update = await Update.findByPk(req.params.id);
    if (!update) {
      return failure(res, "更新信息不存在");
    }
    success(res, "单个更新信息查询成功", update);
  } catch (error) {
    failure(res, error);
  }
});
function filterWhiteList(req) {
  return {
    userId: req.body.userId,
    title: req.body.title,
    content: req.body.content,
  };
}

module.exports = router;
