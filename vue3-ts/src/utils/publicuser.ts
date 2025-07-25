import axiosConfig from "../utils/request";
import { ref } from "vue";
import { useUserStore } from "../store/userStore";
import Cookies from "js-cookie";
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

export interface ContentItem {
  id: number;
  title: string;
  image: string;
  createdAt: string;
  views: number;
  content?: string;
  userId: number;
  label?: string;
}

// 全局响应式状态
export const accounts = ref<Account[]>([]);
export const articles = ref<ContentItem[]>([]);
export const photos = ref<ContentItem[]>([]);
export const notes = ref<ContentItem[]>([]);

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
 * 加载文章/摄影/笔记内容
 * @param currentPage 当前页码
 */
export const loadUserContents = async (currentPage: number = 1) => {
  const limit = 9;
  const userStore = useUserStore();
  const userId = userStore.user?.id ? String(userStore.user.id) : "";
  try {
    const fetchData = (type: string) =>
      axiosConfig.get(`/admin/${type}`, {
        params: { userId, limit, currentPage },
      });
    const [articleRes, photoRes, noteRes] = await Promise.all([
      fetchData("article"),
      fetchData("photography"),
      fetchData("note"),
    ]);
    articles.value = articleRes.data.data.articles || [];
    photos.value = photoRes.data.data.photography || [];
    notes.value = noteRes.data.data.notes || [];
  } catch (error) {
    const message = parseErrorMessage(error);
    console.error("加载用户内容失败:", message);
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
