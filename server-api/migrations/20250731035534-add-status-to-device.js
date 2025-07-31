// migrations/2024XXXXXX-update-device-status-field.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 更新 status 字段为 ENUM 类型
    await queryInterface.changeColumn("devices", "status", {
      type: Sequelize.ENUM("已登录", "未登录"),
      defaultValue: "未登录",
      allowNull: false,
      comment: "登录状态",
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚到 STRING 类型
    await queryInterface.changeColumn("devices", "status", {
      type: Sequelize.STRING,
      defaultValue: "未登录",
      allowNull: false,
      comment: "登录状态",
    });
  },
};
