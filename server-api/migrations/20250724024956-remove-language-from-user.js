// path: migrations/xxxxx-remove-language-from-user.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "language");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "language", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "zh", // 可以恢复默认值
    });
  },
};
