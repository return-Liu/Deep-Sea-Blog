// deviceCleanupScheduler.js
const cron = require("node-cron");
const { Device, Op } = require("../models");
const fs = require("fs");
const path = require("path");
const winston = require("winston"); // 需要安装：npm install winston

// 初始化日志器
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/device-cleanup.log" }),
  ],
});

// Redis 客户端（用于防重）
const redis = require("redis");
const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
client.on("error", (err) => {
  logger.error("Redis 连接失败:", err);
});

class DeviceCleanupScheduler {
  /**
   * 清理不活跃设备
   */
  static async cleanupInactiveDevices() {
    const lockKey = "device_cleanup_lock";
    const lockTimeout = 10 * 60 * 1000; // 10分钟超时

    try {
      // 获取锁，防止并发执行
      const hasLock = await this.acquireLock(lockKey, lockTimeout);
      if (!hasLock) {
        logger.warn("设备清理任务正在执行中，跳过本次执行");
        return;
      }

      logger.info("开始执行清理不活跃设备任务");

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // 查找需要清理的设备
      const devicesToCleanup = await this.findInactiveDevices(sevenDaysAgo);

      if (devicesToCleanup.length === 0) {
        logger.info("没有需要清理的设备");
        await this.releaseLock(lockKey);
        return;
      }

      logger.info(`找到 ${devicesToCleanup.length} 个需要清理的设备`);

      // 备份设备记录
      await this.backupDevices(devicesToCleanup);

      // 批量删除设备
      const deletedCount = await this.batchDeleteDevices(devicesToCleanup);

      logger.info(`成功清理了 ${deletedCount} 个不活跃设备`);
      await this.releaseLock(lockKey);
    } catch (error) {
      logger.error("清理设备时出错:", error);
      await this.releaseLock(lockKey); // 确保释放锁
    }
  }

  /**
   * 获取分布式锁
   */
  static async acquireLock(key, timeout) {
    try {
      const result = await client.set(key, "locked", "NX", "PX", timeout);
      return result === "OK";
    } catch (error) {
      logger.error("获取锁失败:", error);
      return false;
    }
  }

  /**
   * 释放锁
   */
  static async releaseLock(key) {
    try {
      await client.del(key);
    } catch (error) {
      logger.error("释放锁失败:", error);
    }
  }

  /**
   * 查找不活跃设备
   */
  static async findInactiveDevices(sevenDaysAgo) {
    try {
      const devices = await Device.findAll({
        where: {
          lastActiveAt: {
            [Op.lt]: sevenDaysAgo,
          },
        },
      });

      if (devices.length > 0) {
        logger.info(
          `找到 ${devices.length} 个需要清理的设备:`,
          devices.map((d) => d.deviceName)
        );
      }

      return devices;
    } catch (error) {
      logger.error("查找不活跃设备失败:", error);
      return [];
    }
  }

  /**
   * 备份设备记录（按日期命名）
   */
  static async backupDevices(devices) {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const backupPath = path.join(
      __dirname,
      "../logs/device-backup-",
      timestamp,
      ".json"
    );

    const dir = path.dirname(backupPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const backupData = devices.map((device) => ({
      id: device.id,
      deviceName: device.deviceName,
      lastActiveAt: device.lastActiveAt,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    }));

    try {
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      logger.info(`设备记录已备份到 ${backupPath}`);
    } catch (error) {
      logger.error("备份设备记录失败:", error);
    }
  }

  /**
   * 批量删除设备（使用 bulk destroy）
   */
  static async batchDeleteDevices(devices) {
    const ids = devices.map((d) => d.id);
    const deletedCount = await Device.destroy({ where: { id: ids } });

    logger.info(`批量删除完成，共删除 ${deletedCount} 个设备`);

    return deletedCount;
  }

  /**
   * 启动定时任务
   */
  static start() {
    cron.schedule("0 0 * * *", () => {
      this.cleanupInactiveDevices();
    });
    logger.info("定时任务已注册：清理不活跃设备");
  }
}

module.exports = DeviceCleanupScheduler;
