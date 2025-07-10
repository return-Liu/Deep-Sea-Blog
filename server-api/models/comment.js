"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // define association here
      Comment.belongsTo(models.Wall, { foreignKey: "wallId" });
      Comment.belongsTo(models.User, { foreignKey: "userId" });
      // 添加与 LikesComment 的关联（可选）
      Comment.hasMany(models.LikesComment, { foreignKey: "commentId" });
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      wallId: DataTypes.STRING,
      likesCount: DataTypes.INTEGER, // 添加 likesCount 字段
      commentbackground: DataTypes.STRING, // 添加 background 字段
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
