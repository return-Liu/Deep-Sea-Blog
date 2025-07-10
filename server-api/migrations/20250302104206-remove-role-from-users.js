// migrations/xxxx-remove-role-from-users.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "role");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "用户组不能为空",
        },
        notEmpty: {
          msg: "用户组不能为空",
        },
        isIn: {
          args: [[0, 1]],
          msg: "用户组的值必须是 普通用户0 管理员1",
        },
      },
    });
  },
};
