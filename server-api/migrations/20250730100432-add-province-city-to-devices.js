"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 province 字段到 Devices 表
    await queryInterface.addColumn("Devices", "province", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 添加 city 字段到 Devices 表
    await queryInterface.addColumn("Devices", "city", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚操作 - 删除字段
    await queryInterface.removeColumn("Devices", "province");
    await queryInterface.removeColumn("Devices", "city");
  },
};
