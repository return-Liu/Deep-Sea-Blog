const express = require("express");
const router = express.Router();
const { Article, Note, Photography, User } = require("../models");
const { success, failure } = require("../utils/responses");
const { Op } = require("sequelize");
const userAuth = require("../middlewares/user-auth");

router.get("/search", userAuth, async (req, res) => {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.min(Math.abs(Number(query.pageSize)) || 200, 200);
    const offset = (currentPage - 1) * pageSize;

    // 公共基础配置（不包含where条件）
    const baseConfig = {
      attributes: { exclude: ["UserId"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    const promises = [];

    // 处理博客文章查询
    if (query.type === "all" || query.type === "articles") {
      const articleConfig = { ...baseConfig };
      articleConfig.where = {};
      if (query.userId) {
        articleConfig.where.UserId = query.userId;
      }
      if (query.keyword) {
        articleConfig.where[Op.or] = [
          { title: { [Op.like]: `%${query.keyword}%` } },
          { content: { [Op.like]: `%${query.keyword}%` } },
          { label: { [Op.like]: `%${query.keyword}%` } },
        ];
      }
      promises.push(Article.findAndCountAll(articleConfig));
    }

    // 处理摄影图库查询
    if (query.type === "all" || query.type === "photography") {
      const photoConfig = { ...baseConfig };
      photoConfig.where = {};
      if (query.userId) {
        photoConfig.where.UserId = query.userId;
      }
      if (query.keyword) {
        photoConfig.where[Op.or] = [
          { content: { [Op.like]: `%${query.keyword}%` } },
        ];
      }
      promises.push(Photography.findAndCountAll(photoConfig));
    }

    // 处理随记查询
    if (query.type === "all" || query.type === "notes") {
      const noteConfig = { ...baseConfig };
      noteConfig.where = {};
      if (query.userId) {
        noteConfig.where.UserId = query.userId;
      }
      if (query.keyword) {
        noteConfig.where[Op.or] = [
          { title: { [Op.like]: `%${query.keyword}%` } },
          { content: { [Op.like]: `%${query.keyword}%` } },
        ];
      }
      promises.push(Note.findAndCountAll(noteConfig));
    }

    const results = await Promise.all(promises);

    // 初始化结果结构
    const responseData = {
      articles: { list: [], pagination: { total: 0, currentPage, pageSize } },
      photography: {
        list: [],
        pagination: { total: 0, currentPage, pageSize },
      },
      notes: { list: [], pagination: { total: 0, currentPage, pageSize } },
    };

    // 根据查询顺序分配结果
    let index = 0;
    if (query.type === "all" || query.type === "articles") {
      responseData.articles.list = results[index]?.rows || [];
      responseData.articles.pagination.total = results[index]?.count || 0;
      index++;
    }
    if (query.type === "all" || query.type === "photography") {
      responseData.photography.list = results[index]?.rows || [];
      responseData.photography.pagination.total = results[index]?.count || 0;
      index++;
    }
    if (query.type === "all" || query.type === "notes") {
      responseData.notes.list = results[index]?.rows || [];
      responseData.notes.pagination.total = results[index]?.count || 0;
    }

    success(res, "搜索成功", responseData);
  } catch (error) {
    console.error("搜索失败:", error);
    failure(res, error.message || "服务器内部错误");
  }
});

module.exports = router;
