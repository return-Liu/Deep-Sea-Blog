import { defineStore } from "pinia";
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useUserStore } from "./userStore";
import { ElMessage } from "element-plus";
import axiosConfig from "../utils/request";

export const useThemeStore = defineStore("theme", () => {
  const followSystem = ref<boolean>(false);
  const currentTheme = ref<"light" | "dark" | "auto">("auto");
  const user = ref<number | null>(null);

  const handleSystemThemeChange = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    setTheme(systemTheme);
  };

  const setTheme = (mode: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", mode);
  };
  const toggleTheme = async (mode: "auto" | "light" | "dark") => {
    followSystem.value = mode === "auto";
    currentTheme.value = mode;
    if (mode === "auto") {
      addSystemThemeChangeListener();
      handleSystemThemeChange();
    } else {
      removeSystemThemeChangeListener();
      setTheme(mode);
    }

    if (user.value) {
      try {
        await updateThemeInDatabase(user.value, mode);
        // 确保写入 localStorage 的值有效
        if (typeof mode === "string" && mode.trim() !== "") {
          localStorage.setItem(`theme-style-${user.value}`, mode);
        }
      } catch (error) {
        console.error("Failed to update theme in database:", error);
      }
    }
  };

  const loadTheme = async () => {
    const userStore = useUserStore();
    const userFromStore = userStore.user.uuid;

    if (!userFromStore) {
      const savedTheme = localStorage.getItem(`theme-style-${user.value}`);
      const validTheme = (
        ["auto", "light", "dark"].includes(savedTheme as any)
          ? savedTheme
          : "light"
      ) as "auto" | "light" | "dark";
      await toggleTheme(validTheme);
      return;
    }

    user.value = userFromStore;

    try {
      const theme = await getThemeFromDatabase(user.value);
      if (theme && typeof theme === "string" && theme.trim() !== "") {
        localStorage.setItem(`theme-style-${user.value}`, theme);
        await toggleTheme(
          (["auto", "light", "dark"].includes(theme as any)
            ? theme
            : "light") as "auto" | "light" | "dark"
        );
      } else {
        const savedTheme = localStorage.getItem(`theme-style-${user.value}`);
        const fallbackTheme = (
          ["auto", "light", "dark"].includes(savedTheme as any)
            ? savedTheme
            : "light"
        ) as "auto" | "light" | "dark";
        await toggleTheme(fallbackTheme);
      }
    } catch (error) {
      console.error("Failed to load theme from database:", error);
      const savedTheme = userStore.user.theme;
      const fallbackTheme = (
        ["auto", "light", "dark"].includes(savedTheme as any)
          ? savedTheme
          : "light"
      ) as "auto" | "light" | "dark";
      await toggleTheme(fallbackTheme);
    }
  };
  const addSystemThemeChangeListener = () => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleSystemThemeChange);
  };

  const removeSystemThemeChangeListener = () => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", handleSystemThemeChange);
  };

  const setUser = (userId: number | null) => {
    user.value = userId;
  };

  const clearUserTheme = async () => {
    if (user.value) {
      try {
        await clearThemeInDatabase(user.value);
      } catch (error) {
        console.error("Failed to clear theme in database:", error);
      }
      toggleTheme("light");
    }
  };

  onMounted(async () => {
    await loadTheme(); // 确保 loadTheme 先加载用户信息
  });

  onUnmounted(() => {
    removeSystemThemeChangeListener();
  });
  const updateThemeInDatabase = async (userId: number, theme: string) => {
    try {
      await axiosConfig.put(`/theme/${userId}/style`, {
        theme,
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  const getThemeFromDatabase = async (userId: number) => {
    try {
      const response = await axiosConfig.get(`/theme/${userId}/style`);
      return response.data.theme;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  const clearThemeInDatabase = async (userId: number) => {
    try {
      await axiosConfig.delete(`/theme/${userId}/style`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  return {
    getThemeFromDatabase,
    updateThemeInDatabase, // 添加这一行
    followSystem,
    currentTheme,
    user,
    toggleTheme,
    handleSystemThemeChange,
    setTheme,
    loadTheme,
    addSystemThemeChangeListener,
    removeSystemThemeChangeListener,
    setUser,
    clearUserTheme,
    currentThemeMode: computed(() => currentTheme.value),
  };
});
