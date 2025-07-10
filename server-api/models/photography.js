"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Photography extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 关联用户
      Photography.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Photography.init(
    {
      userId: DataTypes.INTEGER,
      image: DataTypes.STRING,
      size: DataTypes.FLOAT,
      content: DataTypes.TEXT, // 添加 content 字段
    },
    {
      sequelize,
      modelName: "Photography",
    }
  );
  return Photography;
};
