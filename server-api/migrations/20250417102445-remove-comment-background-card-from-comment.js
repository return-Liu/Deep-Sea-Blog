"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comments", "commentBackgroundCard");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comments", "commentBackgroundCard", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
