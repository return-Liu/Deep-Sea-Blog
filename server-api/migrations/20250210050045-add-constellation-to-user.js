// migrations/20231010123456-add-constellation-to-user.js
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "constellation", {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [
            [
              "白羊座",
              "金牛座",
              "双子座",
              "巨蟹座",
              "狮子座",
              "处女座",
              "天秤座",
              "天蝎座",
              "射手座",
              "摩羯座",
              "水瓶座",
              "双鱼座",
            ],
          ],
          msg: "星座必须是有效的星座名称",
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "constellation");
  },
};
