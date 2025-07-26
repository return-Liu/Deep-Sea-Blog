"use strict";
const { Model } = require("sequelize");
// models/Device.js
module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    "Device",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      deviceId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      deviceName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deviceType: {
        type: DataTypes.STRING, // mobile, pc, tablet
        allowNull: false,
      },
      os: {
        type: DataTypes.STRING,
      },
      browser: {
        type: DataTypes.STRING,
      },
      ip: {
        type: DataTypes.STRING,
      },
      location: {
        type: DataTypes.STRING,
      },
      lastLoginTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isTrusted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userAgent: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "Devices",
      timestamps: true,
    }
  );

  Device.associate = function (models) {
    Device.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return Device;
};
