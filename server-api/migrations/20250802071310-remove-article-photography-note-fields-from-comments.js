// migrations/xxx-remove-article-photography-note-fields-from-comments.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Comments", "articleId");
    await queryInterface.removeColumn("Comments", "photographyId");
    await queryInterface.removeColumn("Comments", "noteId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Comments", "articleId", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Comments", "photographyId", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("Comments", "noteId", {
      type: Sequelize.INTEGER,
    });
  },
};
