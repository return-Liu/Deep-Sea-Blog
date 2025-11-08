"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Photo.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Photo.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      category: DataTypes.STRING,
      size: DataTypes.FLOAT,
      photo: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Photo",
    }
  );
  return Photo;
};
