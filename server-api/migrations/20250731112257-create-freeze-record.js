"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FreezeRecords", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "被冻结用户ID",
      },
      reporterId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "举报人ID（可为空，表示系统冻结）",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "冻结原因",
      },
      status: {
        type: Sequelize.ENUM("frozen", "unfrozen"),
        defaultValue: "frozen",
        comment: "状态",
      },
      frozenAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: "冻结时间",
      },
      unfrozenAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "解冻时间",
      },
      unfrozenBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "解冻操作人ID",
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
    await queryInterface.dropTable("FreezeRecords");
  },
};
