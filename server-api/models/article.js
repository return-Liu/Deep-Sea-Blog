"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 关联用户
      // 关联用户
      Article.belongsTo(models.User, { foreignKey: "userId" });
      // 关联点赞
      Article.hasMany(models.Like, { foreignKey: "articleId", as: "Likes" });
    }
  }
  Article.init(
    {
      userId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      image: DataTypes.STRING,
      label: DataTypes.STRING,
      content: DataTypes.TEXT,
      likesCount: DataTypes.INTEGER,
      size: DataTypes.FLOAT,
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 添加 views 字段并设置默认值为 0
      },
    },
    {
      sequelize,
      modelName: "Article",
    }
  );
  return Article;
};
