// migrations/xxx-add-lastActiveAt-to-devices.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Devices", "lastActiveAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"), // 使用数据库函数
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Devices", "lastActiveAt");
  },
};
