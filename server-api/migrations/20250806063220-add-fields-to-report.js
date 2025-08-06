"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Reports", "resultType", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Reports", "processTime", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Reports", "resultDetail", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Reports", "resultType");
    await queryInterface.removeColumn("Reports", "processTime");
    await queryInterface.removeColumn("Reports", "resultDetail");
  },
};
