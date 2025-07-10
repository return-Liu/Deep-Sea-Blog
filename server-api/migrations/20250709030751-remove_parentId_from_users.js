"use strict";
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "parentId");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "parentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    });
  },
};
