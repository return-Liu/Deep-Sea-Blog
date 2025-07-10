"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Photographies", [
      {
        userId: 4,
        image:
          "https://img.alicdn.com/imgextra/i2/O1CN01BrCIQR1V7av4fPShl_!!6000000002606-2-tps-1920-1080.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 4,
        image:
          "https://img.alicdn.com/imgextra/i2/O1CN01BrCIQR1V7av4fPShl_!!6000000002606-2-tps-1920-1080.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
