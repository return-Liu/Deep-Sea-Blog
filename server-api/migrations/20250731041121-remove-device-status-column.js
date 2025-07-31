"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 移除 status 字段
    await queryInterface.removeColumn("devices", "status");
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作：重新添加 status 字段
    await queryInterface.addColumn("devices", "status", {
      type: Sequelize.ENUM("已登录", "未登录"),
      defaultValue: "未登录",
      allowNull: false,
      after: "userAgent", // 指定字段位置
    });
  },
};
