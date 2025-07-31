"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加 status 字段
    await queryInterface.addColumn("devices", "status", {
      type: Sequelize.ENUM("已登录", "未登录"),
      defaultValue: "未登录",
      allowNull: false,
      comment: "设备登录状态",
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作：移除 status 字段
    await queryInterface.removeColumn("devices", "status");
  },
};
