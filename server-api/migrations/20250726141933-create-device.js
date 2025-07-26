"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Devices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      userId: {
        type: Sequelize.INTEGER,
      },
      deviceId: {
        type: Sequelize.STRING,
      },
      deviceName: {
        type: Sequelize.STRING,
      },
      deviceType: {
        type: Sequelize.STRING,
      },
      os: {
        type: Sequelize.STRING,
      },
      browser: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      lastLoginTime: {
        type: Sequelize.DATE,
      },
      isTrusted: {
        type: Sequelize.BOOLEAN,
      },
      userAgent: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Devices");
  },
};
