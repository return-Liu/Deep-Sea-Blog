const { User } = require("../models");
const cron = require("node-cron");
const { Op } = require("sequelize");

class AutoUnfreezeService {
  /**
   * 检查并自动解冻符合条件的用户
   */
  static async checkAndUnfreezeUsers() {
    try {
      const now = new Date();

      // 查找需要解冻的用户：临时冻结且解冻时间已到
      const usersToUnfreeze = await this.findUsersToUnfreeze(now);

      if (usersToUnfreeze.length === 0) {
        console.log("没有需要解冻的用户");
        return;
      }

      // 批量更新用户状态
      const updatedCount = await this.batchUpdateUserStatus(usersToUnfreeze);

      console.log(`自动解冻了 ${updatedCount} 个用户`);
    } catch (error) {
      console.error("自动解冻检查失败:", error);
    }
  }

  /**
   * 查找需要解冻的用户
   * @param {Date} now - 当前时间
   * @returns {Array<User>} - 需要解冻的用户列表
   */
  static async findUsersToUnfreeze(now) {
    try {
      const users = await User.findAll({
        where: {
          isFrozen: 1,
          freezeType: "temporary",
          unfreezeAt: {
            [Op.lte]: now, // 解冻时间小于等于当前时间
          },
        },
      });

      if (users.length > 0) {
        console.log(
          `找到 ${users.length} 个需要解冻的用户:`,
          users.map((user) => user.username)
        );
      }

      return users;
    } catch (error) {
      console.error("查找需要解冻的用户失败:", error);
      return [];
    }
  }

  /**
   * 批量更新用户状态
   * @param {Array<User>} users - 需要解冻的用户列表
   * @returns {number} - 成功更新的用户数量
   */
  static async batchUpdateUserStatus(users) {
    let updatedCount = 0;

    try {
      for (const user of users) {
        try {
          await user.update({
            isFrozen: 0,
            frozenReason: null,
            frozenAt: null,
            unfreezeAt: null,
            freezeType: null,
            frozenMessage: null,
          });
          console.log(`用户 ${user.username} 已自动解冻`);
          updatedCount++;
        } catch (updateError) {
          console.error(`更新用户 ${user.username} 的状态失败:`, updateError);
        }
      }
    } catch (error) {
      console.error("批量更新用户状态失败:", error);
    }

    return updatedCount;
  }

  /**
   * 启动定时任务
   */
  static start() {
    // 每分钟检查一次
    cron.schedule("* * * * *", () => {
      this.checkAndUnfreezeUsers();
    });
    console.log("自动解冻服务已启动");
  }
}

module.exports = AutoUnfreezeService;
