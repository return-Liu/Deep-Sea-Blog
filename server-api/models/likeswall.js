"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LikesWall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LikesWall.belongsTo(models.Wall, { foreignKey: "wallsId" });
    }
  }
  LikesWall.init(
    {
      userId: DataTypes.INTEGER,
      wallsId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LikesWall",
    }
  );
  return LikesWall;
};
