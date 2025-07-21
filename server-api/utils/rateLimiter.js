// 用于记录发送频率（key: string）
const verificationCodeRecords = {};

/**
 * 判断是否允许发送验证码（每天最多发送5次）
 * @param {string} key 限制键（如 email:xxx@example.com）
 * @returns {boolean}
 */
function canSendCode(key) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今日00:00时间戳
  const record = verificationCodeRecords[key] || {
    count: 0,
    lastSendDate: today,
  };

  // 如果是新的一天，重置计数
  if (now - record.lastSendDate >= 24 * 60 * 60 * 1000) {
    verificationCodeRecords[key] = {
      count: 1,
      lastSendDate: today,
    };
    return true;
  }

  if (record.count >= 5) {
    return false; // 当天已超过5次
  }

  record.count += 1;
  record.lastSendDate = today;
  verificationCodeRecords[key] = record;
  return true;
}

module.exports = {
  canSendCode,
};
