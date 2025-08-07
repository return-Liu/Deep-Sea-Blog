const express = require("express");
const router = express.Router();
const { Wall, User, Report, LikesWall } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { Op } = require("sequelize");
const { sendEmail } = require("../../utils/email");
const { notifyWallOwner } = require("../../utils/email");
const userAuth = require("../../middlewares/user-auth");
// 查询留言墙列表
router.get("/", userAuth, async (req, res) => {
  const query = req.query;
  const currentPage = Math.abs(Number(query.currentPage)) || 1;
  const pageSize = Math.min(Math.abs(Number(query.pageSize)) || 200, 200);
  const offset = (currentPage - 1) * pageSize;
  const condition = {
    order: [["id", "DESC"]],
    limit: pageSize,
    offset,
    include: [
      {
        model: User,
        attributes: ["id", "nicknameColor"],
      },
    ],
  };
  //   添加过滤条件
  if (query.userId) {
    condition.where = {
      userId: query.userId,
    };
    if (query.name) {
      condition.where = {
        ...condition.where,
        name: { [Op.like]: `%${query.name}%` },
      };
    }
    if (query.content) {
      condition.where = {
        ...condition.where,
        content: { [Op.like]: `%${query.content}%` },
      };
    }
    if (query.category) {
      condition.where = {
        ...condition.where,
        category: { [Op.like]: `%${query.category}%` },
      };
    }
    if (query.likesCount) {
      condition.where = {
        ...condition.where,
        likesCount: { [Op.like]: `%${query.likesCount}%` },
      };
    }
  }
  try {
    const { count, rows } = await Wall.findAndCountAll(condition);
    success(res, "查询留言墙列表成功", {
      walls: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
// 创建留言墙列表
router.post("/", userAuth, async (req, res) => {
  // 白名单过滤
  const body = filterWhiteList(req);
  //   获取用户id
  const userId = body.userId;
  body.userId = userId;
  try {
    await Wall.create(body);
    success(res, "创建留言墙成功", {
      userId: body.userId,
      name: body.name,
      content: body.content,
      category: body.category,
      likesCount: body.likesCount,
      backgroundColor: body.backgroundColor,
    });
  } catch (error) {
    console.error("创建留言墙失败:", error);
    res.status(500).json({ error: "创建留言墙失败" });
  }
});
// 删除留言墙列表
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    // 先删除关联的点赞记录
    await LikesWall.destroy({
      where: { wallsId: id },
    });

    // 再删除留言墙本身
    const deleted = await Wall.destroy({
      where: { id },
    });
    if (!deleted) {
      failure(res, 404, "留言不存在");
    }
    success(res, "删除留言墙及关联点赞记录成功");
  } catch (error) {
    failure(res, error);
  }
});
// 获取举报留言墙列表
router.get("/report", userAuth, async (req, res) => {
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
        attributes: ["id", "email", "username", "nickname", "avatar"],
      },
      {
        model: Wall,
        attributes: [
          "id",
          "name",
          "content",
          "category",
          "likesCount",
          "createdAt",
        ],
        include: [
          {
            model: User,
            attributes: [
              "id",
              "email",
              "username",
              "nickname",
              "avatar",
              "createdAt",
            ],
          },
        ],
      },
    ],
  };

  try {
    const { count, rows } = await Report.findAndCountAll(condition);
    success(res, "获取举报留言墙列表成功", {
      reports: rows.map((report) => ({
        id: report.id,
        userId: report.userId,
        wallId: report.wallId,
        user: report.User,
        wall: report.Wall,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        status: report.status,
        resultType: report.resultType,
        resultDetail: report.resultDetail,
        processTime: report.processTime,
      })),
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
// 通知墙主删掉留言墙 主要采用QQ邮箱的发送方式
// 通知墙主删掉留言墙 主要采用QQ邮箱的发送方式
router.post("/delete/:id", userAuth, async (req, res) => {
  const { id } = req.params;
  const { email } = req.body; // 可选：用于验证或额外通知
  try {
    // 1. 查询留言墙信息
    const wall = await Wall.findOne({
      where: { id },
      include: [
        {
          model: User,
          attributes: ["id", "email", "nickname"],
        },
      ],
    });

    if (!wall) {
      failure(res, 404, "留言墙不存在");
    }

    // 2. 获取留言墙作者信息
    const wallOwner = wall.User;
    if (!wallOwner) {
      failure(res, 404, "留言墙作者不存在");
    }

    // 3. 发送邮件通知墙主
    await notifyWallOwner(wallOwner.email, wall.content);

    // 4. 返回成功响应
    success(res, "已成功通知墙主处理留言墙", {
      wallId: wall.id,
      wallContent: wall.content,
      notifiedEmail: wallOwner.email,
    });
  } catch (error) {
    console.error("删除留言墙或发送邮件失败:", error);
    failure(res, error);
  }
});
// 查询举报留言墙详情
router.get("/report/:id", userAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const report = await Report.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          attributes: ["id", "email", "username", "nickname", "avatar"],
        },
        {
          model: User,
          attributes: [
            "id",
            "email",
            "username",
            "nickname",
            "avatar",
            "createdAt",
          ],
        },
        {
          model: Wall,
          attributes: ["id", "name", "content", "category", "likesCount"],
        },
      ],
    });
    if (!report) {
      failure(res, "举报留言墙不存在");
    }
    success(res, "查询举报留言墙详情成功", {
      report: {
        id: report.id,
        userId: report.userId,
        wallId: report.wallId,
        user: report.User,
        wall: report.Wall,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});
// 举报留言墙
router.post("/report/:id", userAuth, async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    // 检查是否已经举报过
    const existingReport = await Report.findOne({
      where: {
        userId,
        wallId: id,
      },
    });

    if (existingReport) {
      return success(res, "您已经举报过此留言墙,请勿重复举报", {
        report: true,
      });
    }

    await Wall.update(
      {
        report: true,
      },
      {
        where: {
          id,
        },
      }
    );

    await Report.create({
      userId,
      wallId: id,
    });

    success(res, "举报留言墙成功", {
      report: true,
    });
  } catch (error) {
    failure(res, error);
  }
}); // 编辑留言墙
router.put("/:id", userAuth, async (req, res) => {
  const id = req.params.id;
  const body = filterWhiteList(req);
  try {
    await Wall.update(body, {
      where: {
        id,
      },
    });
    success(res, "编辑留言墙成功", {
      name: body.name,
      content: body.content,
      category: body.category,
      backgroundColor: body.backgroundColor,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 删除举报留言墙
router.delete("/report/:id", userAuth, async (req, res) => {
  const id = req.params.id;
  try {
    await Report.findOne({ where: { id } });
    // 执行删除
    const result = await Report.destroy({
      where: {
        id,
      },
    });
    await Report.findOne({ where: { id } });
    if (result) {
      success(res, "删除举报留言墙成功");
    } else {
      failure(res, "未找到对应的举报记录");
    }
  } catch (error) {
    failure(res, error);
  }
});
// 处理举报留言墙

router.put("/report/:id/process", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const report = await Report.findByPk(id);
    if (!report) {
      return failure(res, "举报记录不存在");
    }

    // 更新举报记录状态而不是墙状态
    await report.update({
      status: true, // 标记为已处理
      resultType: req.body.resultType,
      resultDetail: req.body.resultDetail,
      processTime: req.body.processTime,
    });

    success(res, "处理举报留言墙成功");
  } catch (error) {
    failure(res, error);
  }
});
// 公共方法 白名单过滤
function filterWhiteList(req) {
  return {
    userId: req.body.userId,
    name: req.body.name,
    content: req.body.content,
    category: req.body.category,
    likesCount: req.body.likesCount,
    backgroundColor: req.body.backgroundColor,
  };
}
module.exports = router;
