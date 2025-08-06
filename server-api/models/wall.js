"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Wall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wall.belongsTo(models.User, { foreignKey: "userId" });
      Wall.hasMany(models.LikesWall, { foreignKey: "wallsId" });
      Wall.hasMany(models.Report, { foreignKey: "wallId" });
    }
  }
  Wall.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      content: DataTypes.TEXT,
      likesCount: DataTypes.INTEGER,
      category: DataTypes.STRING,
      backgroundColor: DataTypes.STRING, // 添加背景颜色字段
    },
    {
      sequelize,
      modelName: "Wall",
    }
  );
  return Wall;
};
