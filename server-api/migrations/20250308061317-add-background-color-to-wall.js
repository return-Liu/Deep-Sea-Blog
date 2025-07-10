module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Walls", "backgroundColor", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "#ffffff", // 默认颜色为白色
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Walls", "backgroundColor");
  },
};
