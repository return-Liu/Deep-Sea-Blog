const express = require("express");
const router = express.Router();
const { Feedback } = require("../../models");
const { success, failure } = require("../../utils/responses");
const userAuth = require("../../middlewares/user-auth");
// 提交反馈
router.post("/:id", userAuth, async (req, res) => {
  const userId = req.params.id; // 从URL参数获取userId
  try {
    const body = filterWhiteList(req);
    body.userId = userId; // 将userId添加到要保存的数据中

    await Feedback.create(body);
    success(res, "反馈提交成功", {
      name: body.name,
      feedback: body.feedback,
      email: body.email,
      userId: body.userId,
    });
  } catch (error) {
    failure(res, error);
  }
});
// 获取所有反馈
router.get("/", userAuth, async (req, res) => {
  try {
    // 通过分页
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;
    const condition = {
      order: [["id", "DESC"]],
      limit: pageSize,
      offset,
    };
    if (query.name) {
      condition.where = {
        name: {
          [Op.like]: `%${query.name}%`,
        },
      };
    }
    if (query.email) {
      condition.where = {
        email: {
          [Op.like]: `%${query.email}%`,
        },
      };
    }
    if (query.feedback) {
      condition.where = {
        feedback: {
          [Op.like]: `%${query.feedback}%`,
        },
      };
    }
    const { count, rows } = await Feedback.findAndCountAll(condition);
    success(res, "查询反馈列表成功", {
      feedbacks: rows,
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
// 删除反馈
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return failure(res, "反馈不存在");
    }
    await feedback.destroy();
    success(res, "删除反馈成功");
  } catch (error) {
    failure(res, error);
  }
});
// 示例：在 report 路由文件中添加类似的处理逻辑
router.put("/:id/process", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const report = await Report.findByPk(id);
    if (!report) {
      return failure(res, "举报不存在");
    }

    // 更新处理信息
    await report.update({
      status: true,
      resultType: req.body.resultType,
      resultDetail: req.body.resultDetail,
      processTime: req.body.processTime,
    });

    success(res, "处理举报成功");
  } catch (error) {
    failure(res, error);
  }
});
// 公共方法 白名单过滤
function filterWhiteList(req) {
  return {
    name: req.body.name,
    email: req.body.email,
    feedback: req.body.feedback,
    userId: req.params.id, // 从URL参数获取userId
  };
}
module.exports = router;
