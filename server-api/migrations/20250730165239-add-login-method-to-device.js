"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Devices", "loginMethod", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "未知登录方式",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Devices", "loginMethod");
  },
};
