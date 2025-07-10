// migrations/20231010123456-add-client-feature-code-to-users.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "clientFeatureCode", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "特征码不能为空",
        },
        notEmpty: {
          msg: "特征码不能为空",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "clientFeatureCode");
  },
};
