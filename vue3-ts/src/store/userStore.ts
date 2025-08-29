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

  // 删除所有用户图片
  const deleteAllUserImages = async () => {
    try {
      if (!user.value) {
        ElMessage.error("用户信息未找到，请重新登录");
        return;
      }

      const endpoints = [
        { endpoint: "/admin/article", key: "articles" },
        { endpoint: "/admin/photography", key: "photography" },
        { endpoint: "/admin/note", key: "notes" },
      ];

      const imagePaths = new Set<string>();

      for (const { endpoint, key } of endpoints) {
        try {
          const response = await axiosConfig.get(endpoint, {
            params: { userId: user.value.id },
          });

          response.data.data[key].forEach((item: { image: string }) => {
            if (item.image && item.image.startsWith(apiUrl)) {
              imagePaths.add(item.image);
            }
          });
        } catch (error) {
          console.error(`获取 ${endpoint} 数据失败`, error);
          ElMessage.error(`获取 ${endpoint} 数据失败，请稍后再试`);
          return;
        }
      }

      if (imagePaths.size === 0) {
        return;
      }

      const failedImages: string[] = [];
      const deletePromises = Array.from(imagePaths).map(async (imagePath) => {
        const imageName = imagePath.split("/").pop();
        if (!imageName) return;

        try {
          await axiosConfig.delete(`${apiUrl}/admin/upload/image/${imageName}`);
        } catch (error) {
          console.error(`删除图片 ${imageName} 失败`, error);
          failedImages.push(imageName);
        }
      });

      await Promise.all(deletePromises);

      if (failedImages.length > 0) {
        ElMessage.error(`部分图片删除失败：${failedImages.join(", ")}`);
      } else {
        ElMessage.success("所有图片删除成功");
      }
    } catch (error) {
      console.error("删除所有用户图片失败", error);
      ElMessage.error("删除所有用户图片失败，请稍后再试");
    }
  };

  return {
    user,
    setUser,
    loadUser,
    updateUser,
    deleteAllUserImages,
    currentUser,
    openAuthorProfile,
  };
});
