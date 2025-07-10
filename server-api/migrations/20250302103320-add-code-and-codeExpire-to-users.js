// migrations/xxxx-add-code-and-codeExpire-to-users.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "code", {
      type: Sequelize.STRING(6),
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn("Users", "codeExpire", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "code");
    await queryInterface.removeColumn("Users", "codeExpire");
  },
};
