"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LikesComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LikesComment.belongsTo(models.Comment, {
        foreignKey: "commentId",
      });
    }
  }
  LikesComment.init(
    {
      userId: DataTypes.INTEGER,
      commentId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LikesComment",
    }
  );
  return LikesComment;
};
