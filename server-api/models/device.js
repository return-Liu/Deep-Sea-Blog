"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Device.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: DataTypes.INTEGER,
      deviceId: DataTypes.STRING,
      deviceName: DataTypes.STRING,
      deviceType: DataTypes.STRING,
      os: DataTypes.STRING,
      browser: DataTypes.STRING,
      location: DataTypes.STRING,
      lastLoginTime: DataTypes.DATE,
      loginMethod: DataTypes.STRING,
      userAgent: DataTypes.TEXT,

      province: DataTypes.STRING,
      city: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Device",
    }
  );
  return Device;
};
