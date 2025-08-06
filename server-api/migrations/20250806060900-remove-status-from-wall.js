"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 删除 Walls 表中的 status 字段
    await queryInterface.removeColumn("Walls", "status");
  },

  down: async (queryInterface, Sequelize) => {
    // 如果需要回滚，重新添加 status 字段
    await queryInterface.addColumn("Walls", "status", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
