import { ref, computed } from "vue";
import axiosConfig from "../utils/request";
import { ElMessage } from "element-plus";
import { apiUrl } from "../config";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";

// 用户相关的接口
interface User {
  id: number;
  nickname: string;
  avatar?: string;
  sex: number;
  birthday: string;
  introduce: string;
  constellation: string;
  email?: string;
  account?: string;
  nicknameColor?: string;
  clientFeatureCode?: string;
  area?: string;
  uuid: number;
  username?: string; // 添加 username 字段
  phone?: string; // 添加 phone 字段
  theme?: string; // 添加 theme 字段
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User>({
    id: 0,
    nickname: "",
    avatar: "",
    sex: 0,
    birthday: "",
    introduce: "",
    constellation: "",
    email: "",
    account: "",
    nicknameColor: "",
    clientFeatureCode: "",
    area: "",
    uuid: 0,
    username: "",
    phone: "",
    theme: "",
  });

  // 获取当前用户信息
  const currentUser = computed(() => user.value);
  const router = useRouter();
  const openAuthorProfile = () => {
    router.push({
      name: "users",
      params: { uuid: user.value.uuid },
    });
  };
  const setUser = (userData: User) => {
    user.value = userData;
  };

  // 加载用户信息
  const loadUser = async (userId?: number) => {
    try {
      const response = await axiosConfig.get("/users/me", {
        params: { userId: userId || user.value.uuid },
      });
      setUser(response.data.data);
    } catch (error) {
      console.error("加载用户信息失败:", error);
    }
  };

  // 更新用户信息
  const updateUser = (updatedFields: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedFields };
    }
  };

  return {
    user,
    setUser,
    loadUser,
    updateUser,
    currentUser,
    openAuthorProfile,
  };
});
