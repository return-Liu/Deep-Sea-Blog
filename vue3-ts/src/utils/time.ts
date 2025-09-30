/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param time 时间字符串或时间戳
 * @returns 格式化后的时间字符串
 */
export function formatTime(
  time: string | number | Date | undefined | null
): string {
  if (!time) return "-";

  let date: Date;
  if (typeof time === "string") {
    // 处理不同格式的时间字符串
    date = new Date(
      time
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d+Z?$/, "")
    );
  } else if (typeof time === "number") {
    // 处理时间戳（包括秒和毫秒）
    date = new Date(time > 10000000000 ? time : time * 1000);
  } else {
    date = time;
  }

  // 检查日期是否有效
  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时间为相对时间（如：刚刚、几分钟前、几小时前等）
 * @param time 时间字符串或时间戳
 * @returns 相对时间描述
 */
export function formatRelativeTime(
  time: string | number | Date | undefined | null
): string {
  if (!time) return "-";

  let date: Date;
  if (typeof time === "string") {
    date = new Date(
      time
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d+Z?$/, "")
    );
  } else if (typeof time === "number") {
    date = new Date(time > 10000000000 ? time : time * 1000);
  } else {
    date = time;
  }

  if (isNaN(date.getTime())) return "-";

  const now = new Date().getTime();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return "刚刚";
  } else if (minutes < 1) {
    return `${seconds}秒前`;
  } else if (hours < 1) {
    return `${minutes}分钟前`;
  } else if (days < 1) {
    return `${hours}小时前`;
  } else if (days < 30) {
    return `${days}天前`;
  } else {
    // 超过30天显示完整日期
    return formatTime(date);
  }
}

/**
 * 格式化时间为 YYYY-MM-DD 格式
 * @param time 时间字符串或时间戳
 * @returns 格式化的日期字符串
 */
export function formatDate(
  time: string | number | Date | undefined | null
): string {
  if (!time) return "-";

  let date: Date;
  if (typeof time === "string") {
    date = new Date(
      time
        .replace(/-/g, "/")
        .replace("T", " ")
        .replace(/\.\d+Z?$/, "")
    );
  } else if (typeof time === "number") {
    date = new Date(time > 10000000000 ? time : time * 1000);
  } else {
    date = time;
  }

  if (isNaN(date.getTime())) return "-";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default {
  formatTime,
  formatRelativeTime,
  formatDate,
};
