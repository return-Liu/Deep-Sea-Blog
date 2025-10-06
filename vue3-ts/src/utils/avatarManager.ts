import axiosConfig from "./request";
import { useUserStore } from "../store/userStore";
import { getAllUsers } from "./publicuser";
import { ElMessage } from "element-plus";
import { apiUrl } from "../config";

// 定时刷新签名
let refreshTimer: number | null = null;

// 增加默认头像判断函数
const isDefaultAvatar = (filename: string): boolean => {
  if (!filename) return true;
  return (
    filename.includes("defaultAvatar") ||
    filename.includes("cube.elemecdn.com") ||
    !filename.includes("avatar/")
  );
};

// 设置头像刷新定时器
const setupAvatarRefresh = (checkFn: () => Promise<void>) => {
  // 清除现有的定时器
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // 设置新的定时器
  refreshTimer = window.setInterval(async () => {
    await checkFn();
  }, 60 * 60 * 1000); // 1小时检查一次

  return refreshTimer;
};
// 检查并更新头像（如果需要）
const checkAndUpdateAvatarIfNeeded = async (
  avatarUrl: string,
  refreshFn: (filename: string) => Promise<string | null>
) => {
  if (avatarUrl && !isDefaultAvatar(avatarUrl)) {
    try {
      const url = new URL(avatarUrl);
      const filename = url.pathname.split("/").pop();
      if (filename) {
        await refreshFn(filename);
      }
    } catch (error) {
      console.error("预刷新头像签名失败:", error);
    }
  }
};

// 清理定时器
const cleanupAvatarRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 刷新头像签名URL（增加重试机制）
const refreshAvatarSignature = async (
  filename: string,
  retries = 3
): Promise<string | null> => {
  try {
    const signedUrlResponse = await axiosConfig.get<{ data: { url: string } }>(
      `${apiUrl}/admin/uploadavatar/avatar/sign?filename=${encodeURIComponent(
        filename
      )}`
    );
    return signedUrlResponse.data.data.url;
  } catch (error) {
    if (retries > 0) {
      console.warn(`签名刷新失败，剩余重试次数: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
      return refreshAvatarSignature(filename, retries - 1);
    }
    console.error("刷新签名URL失败:", error);
    return null;
  }
};

// 删除旧头像
const deleteOldAvatar = async (avatarUrl: string): Promise<boolean> => {
  try {
    if (!avatarUrl || isDefaultAvatar(avatarUrl)) {
      return true;
    }

    const url = new URL(avatarUrl);
    const avatarFileName = url.pathname.split("/").pop();
    if (avatarFileName) {
      await axiosConfig.delete(
        `${apiUrl}/admin/uploadavatar/avatar/${avatarFileName}`
      );
      return true;
    }
    return false;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "删除失败";
    console.error("删除旧头像失败:", errorMessage);
    return false;
  }
};

// 处理裁剪后的头像
const handleCroppedAvatar = async (blob: Blob, userId: number) => {
  try {
    const formData = new FormData();
    formData.append("avatar", blob, "avatar.png");
    formData.append("userId", userId.toString());

    const response = await axiosConfig.post<{
      data: { avatar: string };
      message: string;
    }>(`${apiUrl}/admin/uploadavatar/cropAvatar`, formData);

    return response.data.data.avatar;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "上传失败";
    throw new Error(errorMessage);
  }
};

// 用于在组件中使用头像管理功能
export const useAvatarManager = () => {
  const userStore = useUserStore();

  const updateAvatar = async (blob: Blob) => {
    try {
      // 删除旧头像
      if (userStore.user.avatar && !isDefaultAvatar(userStore.user.avatar)) {
        await deleteOldAvatar(userStore.user.avatar);
      }

      // 上传新头像
      const newAvatarFilename = await handleCroppedAvatar(
        blob,
        userStore.user.id
      );

      // 获取签名URL
      const signedUrl = await refreshAvatarSignature(newAvatarFilename);

      if (signedUrl) {
        // 更新用户头像
        userStore.user.avatar = signedUrl;
        getAllUsers();
        userStore.loadUser();
        ElMessage.success("头像更新成功");

        return signedUrl;
      } else {
        throw new Error("获取签名URL失败");
      }
    } catch (error: any) {
      const errorMessage = error?.message || "头像更新失败";
      ElMessage.error(errorMessage);
      throw error;
    }
  };

  return {
    updateAvatar,
    refreshAvatarSignature,
    deleteOldAvatar,
    isDefaultAvatar,
    setupAvatarRefresh,
    checkAndUpdateAvatarIfNeeded,
    cleanupAvatarRefresh,
  };
};

export default {
  useAvatarManager,
  refreshAvatarSignature,
  deleteOldAvatar,
  isDefaultAvatar,
  setupAvatarRefresh,
  checkAndUpdateAvatarIfNeeded,
  cleanupAvatarRefresh,
};
