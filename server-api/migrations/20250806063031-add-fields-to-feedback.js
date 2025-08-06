"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Feedbacks", "resultType", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Feedbacks", "processTime", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Feedbacks", "resultDetail", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Feedbacks", "resultType");
    await queryInterface.removeColumn("Feedbacks", "processTime");
    await queryInterface.removeColumn("Feedbacks", "resultDetail");
  },
};
