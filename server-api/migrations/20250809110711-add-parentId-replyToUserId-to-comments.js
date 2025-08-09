"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 检查并添加 parentId 字段
    try {
      await queryInterface.addColumn("Comments", "parentId", {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "父评论ID",
      });
    } catch (error) {
      // 如果字段已存在，忽略错误
      if (!error.message.includes("Duplicate column name")) {
        throw error;
      }
      console.log("Column parentId already exists, skipping...");
    }

    // 检查并添加 replyToUserId 字段
    try {
      await queryInterface.addColumn("Comments", "replyToUserId", {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: "被回复的用户ID",
      });
    } catch (error) {
      // 如果字段已存在，忽略错误
      if (!error.message.includes("Duplicate column name")) {
        throw error;
      }
      console.log("Column replyToUserId already exists, skipping...");
    }

    // 为 parentId 字段添加索引（如果不存在）
    try {
      await queryInterface.addIndex("Comments", ["parentId"], {
        name: "comments_parent_id_index",
      });
    } catch (error) {
      console.log("Index comments_parent_id_index already exists, skipping...");
    }

    // 为 replyToUserId 字段添加索引（如果不存在）
    try {
      await queryInterface.addIndex("Comments", ["replyToUserId"], {
        name: "comments_reply_to_user_id_index",
      });
    } catch (error) {
      console.log(
        "Index comments_reply_to_user_id_index already exists, skipping..."
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // 删除索引
    try {
      await queryInterface.removeIndex(
        "Comments",
        "comments_reply_to_user_id_index"
      );
    } catch (error) {
      console.log(
        "Index comments_reply_to_user_id_index does not exist, skipping..."
      );
    }

    try {
      await queryInterface.removeIndex("Comments", "comments_parent_id_index");
    } catch (error) {
      console.log("Index comments_parent_id_index does not exist, skipping...");
    }

    // 删除字段
    try {
      await queryInterface.removeColumn("Comments", "replyToUserId");
    } catch (error) {
      console.log("Column replyToUserId does not exist, skipping...");
    }

    try {
      await queryInterface.removeColumn("Comments", "parentId");
    } catch (error) {
      console.log("Column parentId does not exist, skipping...");
    }
  },
};
