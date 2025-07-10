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
  function getFileName(url: string) {
    if (!url) return "未知文件";
    const parts = url.split("/");
    return parts[parts.length - 1];
  }
  return {
    formatFileSize,
    getFileName,
  };
}
