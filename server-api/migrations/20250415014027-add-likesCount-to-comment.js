"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comments", "likesCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0, // 设置默认值为 0
      allowNull: false, // 不允许为空
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comments", "likesCount");
  },
};
