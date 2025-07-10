// migrations/xxxx-add-nicknameColor-to-users.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "nicknameColor", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "#000000",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "nicknameColor");
  },
};
