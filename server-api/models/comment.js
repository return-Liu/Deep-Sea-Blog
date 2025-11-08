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

      // 添加回复功能的关联
      Comment.belongsTo(models.Comment, {
        as: "parent",
        foreignKey: "parentId",
      });
      Comment.hasMany(models.Comment, {
        as: "replies",
        foreignKey: "parentId",
      });
      Comment.belongsTo(models.User, {
        as: "ReplyToUser",
        foreignKey: "replyToUserId",
      });
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      wallId: DataTypes.INTEGER,
      likesCount: DataTypes.INTEGER,
      commentbackground: DataTypes.STRING,
      // 添加回复功能所需的字段
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Comments",
          key: "id",
        },
      },
      replyToUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
