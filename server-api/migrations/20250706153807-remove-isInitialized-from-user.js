module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "isInitialized");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "isInitialized", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true, // 可根据需要调整
    });
  },
};
