// migrations/xxxx-remove-isTrusted-and-trustExpire-from-devices.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Devices", "isTrusted");
    await queryInterface.removeColumn("Devices", "trustExpire");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Devices", "isTrusted", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("Devices", "trustExpire", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
