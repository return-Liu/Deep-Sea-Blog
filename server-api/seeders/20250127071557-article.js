"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Articles", [
      {
        userId: 4,
        title: "学习如何使用 Sequelize ORM",
        content:
          "Sequelize 是一个基于 promise 的 Node.js ORM，用于 Postgres, MySQL, MariaDB, SQLite 和 Microsoft SQL Server。它提供了许多有用的功能，例如事务支持、关联和复制等。",
        image:
          "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png",
        label: "Sequelize ORM",
        likesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 4,
        title: "如何在 React 中使用 Redux",
        content:
          "Redux 是 JavaScript 应用的状态容器，它可以帮助你管理应用中的状态。在 React 中使用 Redux 可以让你更容易地管理和更新组件的状态。",
        image:
          "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png",
        label: "React Redux",
        likesCount: 0,
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
