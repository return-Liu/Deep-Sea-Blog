"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.User, { foreignKey: "userId" });
      Report.belongsTo(models.Wall, { foreignKey: "wallId" });
    }
  }
  Report.init(
    {
      userId: DataTypes.INTEGER,
      wallId: DataTypes.INTEGER,
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
    },
    {
      sequelize,
      modelName: "Report",
    }
  );
  return Report;
};
