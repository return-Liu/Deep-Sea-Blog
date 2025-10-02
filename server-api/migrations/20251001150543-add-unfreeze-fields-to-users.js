"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "unfreezeAt", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "解冻时间",
    });

    await queryInterface.addColumn("Users", "freezeType", {
      type: Sequelize.ENUM("temporary", "permanent"),
      defaultValue: "temporary",
      comment: "冻结类型 temporary-临时 permanent-永久",
    });

    await queryInterface.addColumn("Users", "frozenMessage", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "冻结消息",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "unfreezeAt");
    await queryInterface.removeColumn("Users", "freezeType");
    await queryInterface.removeColumn("Users", "frozenMessage");
  },
};
