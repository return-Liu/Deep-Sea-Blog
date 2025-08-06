"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 添加模型关联
      Feedback.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Feedback.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      resultType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      processTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resultDetail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // 添加 userId 字段
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Feedback",
    }
  );
  return Feedback;
};
