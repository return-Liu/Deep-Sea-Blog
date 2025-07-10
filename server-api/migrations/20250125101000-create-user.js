"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      nickname: {
        type: Sequelize.STRING,
      },
      sex: {
        // 0: 未知, 1: 男, 2: 女
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      role: {
        type: Sequelize.TINYINT,
        // 0: 普通, 1: 管理
        defaultValue: 0,
      },
      avatar: {
        type: Sequelize.STRING,
      },
      birthday: {
        type: Sequelize.DATE,
      },
      introduce: {
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
    await queryInterface.addIndex("Users", {
      fields: ["email"],
      unique: true,
    });
    await queryInterface.addIndex("Users", {
      fields: ["username"],
      unique: true,
    });
    await queryInterface.addIndex("Users", {
      fields: ["nickname"],
      unique: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
