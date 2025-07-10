/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 防抖等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: unknown, ...args: Parameters<T>): void {
    if (timeout !== null) clearTimeout(timeout);
    const that = this;
    timeout = setTimeout(function () {
      func.apply(that, args);
    }, wait);
  };
}
