// migrations/xxx-remove-role-from-users.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 删除 users 表中的 role 字段
    await queryInterface.removeColumn("Users", "role");
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚时重新添加 role 字段
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
