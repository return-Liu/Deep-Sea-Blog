"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OperationLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 关联用户模型
      OperationLog.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  OperationLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        field: "user_id",
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "操作类型",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "操作描述",
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: "ip_address",
        comment: "IP地址",
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "user_agent",
        comment: "用户代理",
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "操作详情",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "OperationLog",
      tableName: "operation_logs",
      timestamps: true,
      underscored: true,
    }
  );

  return OperationLog;
};
