import { ref, computed } from "vue";
import axiosConfig from "../utils/request";
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
  role?: string; // 添加 role 字段
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
    role: "user", // 添加默认角色
  });

  // 获取当前用户信息
  const currentUser = computed(() => user.value);
  const router = useRouter();

  // 获取用户信息的方法
  const fetchUserInfo = async () => {
    try {
      const response = await axiosConfig.get("/auth/currentuser");
      user.value = { ...user.value, ...response.data.data };
    } catch (error) {
      console.error("获取用户信息失败:", error);
      throw error;
    }
  };

  // 设置用户信息
  const setUser = (userData: Partial<User>) => {
    user.value = { ...user.value, ...userData };
  };

  // 清除用户信息
  const clearUser = () => {
    user.value = {
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
      role: "user",
    };
  };

  // 检查用户是否为管理员
  const isAdmin = computed(() => {
    return user.value.role === "admin";
  });

  // 检查用户是否已登录
  const isLoggedIn = computed(() => {
    return user.value.id > 0;
  });

  const openAuthorProfile = () => {
    router.push({
      name: "users",
      params: { uuid: user.value.uuid },
    });
  };
  const layout = () => {
    router.push("/login/index");
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
    currentUser,
    fetchUserInfo,
    setUser,
    clearUser,
    isAdmin,
    isLoggedIn,
    openAuthorProfile,
    loadUser,
    updateUser,
    layout,
  };
});
