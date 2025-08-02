import axiosConfig from "../utils/request";
import { ref } from "vue";
import Cookies from "js-cookie";
import { useRoute } from "vue-router";

/**
 * 用户数据接口
 */
interface Account {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  nicknameColor: string;
  clientFeatureCode?: string;
}

// 全局响应式状态
export const accounts = ref<Account[]>([]);
export const uuid = ref("");

/**
 * 获取所有用户并缓存第一个用户的特征码
 */
export const getAllUsers = async () => {
  try {
    const res = await axiosConfig.get("/auth/accounts");
    const users = res.data.data as Account[];

    if (users.length > 0) {
      const currentUserUuid = users[0].clientFeatureCode;
      const savedUuid = Cookies.set("userFeatureCode", currentUserUuid || "");

      if (!savedUuid) {
        Cookies.set("userFeatureCode", "");
      }

      accounts.value = users;
    }

    return accounts.value;
  } catch (error) {
    const message = parseErrorMessage(error);
    console.error("获取用户列表失败:", message);

    return null;
  }
};

/**
 * 错误信息解析工具函数
 */
function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, any>;
    return (
      errObj?.response?.data?.message ||
      errObj.message ||
      JSON.stringify(errObj)
    );
  }

  return "未知错误";
}
