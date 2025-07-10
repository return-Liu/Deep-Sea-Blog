// migrations/20250709022406-add-parentId-to-users.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "parentId", {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: "Users",
        key: "uuid",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "parentId");
  },
};
