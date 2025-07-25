// migrations/xxxx-add-theme-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "theme", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "light",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "theme");
  },
};
