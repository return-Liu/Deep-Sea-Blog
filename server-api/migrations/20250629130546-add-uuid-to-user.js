// file: migrations/20250629130546-add-uuid-to-user.js

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "uuid", {
      type: Sequelize.STRING,
      allowNull: true, // 先允许为空
      unique: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "uuid");
  },
};
