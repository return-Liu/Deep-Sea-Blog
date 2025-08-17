"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Devices", "location");
    await queryInterface.removeColumn("Devices", "province");
    await queryInterface.removeColumn("Devices", "city");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Devices", "location", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Devices", "province", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("Devices", "city", {
      type: Sequelize.STRING,
    });
  },
};
