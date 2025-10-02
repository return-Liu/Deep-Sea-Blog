// utils/DeviceCleanupScheduler.js
const cron = require("node-cron");
const { Device, Op } = require("../models");

class DeviceCleanupScheduler {
  static async cleanupInactiveDevices() {
    console.log("开始执行清理不活跃设备任务");
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await Device.destroy({
        where: {
          // 清理所有7天内没有活跃的设备，无论是否登录
          lastActiveAt: {
            [Op.lt]: sevenDaysAgo,
          },
        },
      });

      console.log(`清理了 ${result} 个不活跃设备（7天内无活动）`);
    } catch (error) {
      console.error("清理设备时出错:", error);
    }
  }

  static start() {
    // 每天凌晨执行
    cron.schedule("0 0 * * *", () => {
      this.cleanupInactiveDevices();
    });
    console.log("定时任务已注册：清理不活跃设备");
  }
}

module.exports = DeviceCleanupScheduler;
