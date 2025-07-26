"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Devices", "trustExpire", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "信任过期时间",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Devices", "trustExpire");
  },
};
