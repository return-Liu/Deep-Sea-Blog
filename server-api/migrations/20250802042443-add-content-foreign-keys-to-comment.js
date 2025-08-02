"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Comments", "articleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Articles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Comments", "photographyId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Photographies",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("Comments", "noteId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Notes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Comments", "articleId");
    await queryInterface.removeColumn("Comments", "photographyId");
    await queryInterface.removeColumn("Comments", "noteId");
  },
};
