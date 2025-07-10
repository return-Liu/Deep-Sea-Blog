"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comments", "commentBackgroundCard", {
      type: Sequelize.TEXT,
      allowNull: true, // 根据需求设置是否允许为空
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comments", "commentBackgroundCard");
  },
};
