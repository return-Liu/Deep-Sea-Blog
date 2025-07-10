"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Comments", "useravatar");
    await queryInterface.removeColumn("Comments", "username");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Comments", "useravatar", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Comments", "username", {
      type: Sequelize.STRING,
    });
  },
};
