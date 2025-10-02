const { User } = require("../models");
const cron = require("node-cron");
const { Op } = require("sequelize");

class AutoUnfreezeService {
  static async checkAndUnfreezeUsers() {
    try {
      const now = new Date();

      // 查找需要解冻的用户：临时冻结且解冻时间已到
      const usersToUnfreeze = await User.findAll({
        where: {
          isFrozen: 1,
          freezeType: "temporary",
          unfreezeAt: {
            [Op.lte]: now, // 解冻时间小于等于当前时间
          },
        },
      });

      for (const user of usersToUnfreeze) {
        await user.update({
          isFrozen: 0,
          frozenReason: null,
          frozenAt: null,
          unfreezeAt: null,
          freezeType: null,
          frozenMessage: null,
        });

        console.log(`用户 ${user.username} 已自动解冻`);
      }

      if (usersToUnfreeze.length > 0) {
        console.log(`自动解冻了 ${usersToUnfreeze.length} 个用户`);
      }
    } catch (error) {
      console.error("自动解冻检查失败:", error);
    }
  }

  static start() {
    // 每分钟检查一次
    cron.schedule("* * * * *", () => {
      this.checkAndUnfreezeUsers();
    });
    console.log("自动解冻服务已启动");
  }
}

module.exports = AutoUnfreezeService;
