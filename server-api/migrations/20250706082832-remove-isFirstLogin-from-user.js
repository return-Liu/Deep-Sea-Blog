"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isFirstLogin");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "isFirstLogin", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
