// models/user.js
"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 关联数据 文章 摄影 随记 更新 留言墙
      User.hasMany(models.Article, { foreignKey: "userId" });
      User.hasMany(models.Photography, { foreignKey: "userId" });
      User.hasMany(models.Note, { foreignKey: "userId" });
      User.hasMany(models.Update, { foreignKey: "userId" });
      User.hasMany(models.Wall, { foreignKey: "userId" });
      User.hasMany(models.Device, { foreignKey: "userId" });
      User.hasMany(models.Feedback, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      theme: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "light", // 默认主题设置
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          // is: {
          //   args: [/^1[3-9]\d{9}$/], // 简单的中国大陆手机号格式校验
          //   msg: "手机号格式不正确",
          // },
          // 添加自定义验证，允许空值
          isValidPhone(value) {
            if (value && !/^1[3-9]\d{9}$/.test(value)) {
              throw new Error("手机号格式不正确");
            }
          },
        },
      },

      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: true,
          async isUnique(value) {
            const user = await User.findOne({ where: { uuid: value } });
            if (user) {
              throw new Error("UUID 已存在，请重新生成");
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "邮箱不能为空",
          },
          isEmail: {
            msg: "邮箱格式不正确",
          },
          notEmpty: {
            msg: "邮箱不能为空",
          },

          async isUnique(value) {
            // 只在创建时或邮箱变更时检查唯一性
            if (this.isNewRecord || this.changed("email")) {
              const user = await User.findOne({ where: { email: value } });
              if (user && user.id !== this.id) {
                throw new Error("邮箱已被注册,请使用其他邮箱");
              }
            }
          },
        },
      },
      username: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "密码不能为空" }, // 只有当有值时才验证长度
          set(value) {
            if (!value) return; // ✅ 如果为空，直接返回，不处理
            if (value.length >= 6 && value.length <= 45) {
              this.setDataValue("password", bcrypt.hashSync(value, 10));
            }
          },
        },
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue:
          "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png",
      },
      sex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      introduce: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },
      constellation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clientFeatureCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nicknameColor: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#000000", // 默认颜色
      },
      // 主要用于重置密码或者邮箱验证码
      code: {
        type: DataTypes.STRING(6),
        allowNull: true,
        defaultValue: null,
      },
      // 验证码过期时间
      codeExpire: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      area: {
        // 新增的 area 字段
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
