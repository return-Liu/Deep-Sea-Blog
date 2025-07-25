// migrations/xxxx-add-language-to-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "language", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "zh", // 默认语言
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Users", "language");
  },
};
