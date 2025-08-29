export function useResources() {
  // 格式化文件大小
  function formatFileSize(size: number): string {
    if (size < 1024) return size + " B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    else if (size < 1024 * 1024 * 1024)
      return (size / (1024 * 1024)).toFixed(2) + " MB";
    else return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
  // 获取文件名
  function getFileName(url: string): string {
    if (!url) return "未知文件";
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.pathname.split("/").pop() || "未知文件";
    } catch (error) {
      // 如果不是合法 URL，则退回到原来的逻辑
      return url.split("/").pop() || "未知文件";
    }
  }
  return {
    formatFileSize,
    getFileName,
  };
}
