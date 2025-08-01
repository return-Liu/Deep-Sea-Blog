"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Notes", "size", {
      type: Sequelize.FLOAT,
      allowNull: true, // 根据需求设置是否允许为空
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Notes", "size");
  },
};
