module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Walls", "photo");
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Walls", "photo", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
