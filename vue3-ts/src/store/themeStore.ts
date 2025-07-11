import { defineStore } from "pinia";
import { ref, onMounted, computed, onUnmounted } from "vue";
import { useUserStore } from "./userStore";
export const useThemeStore = defineStore("theme", () => {
  const followSystem = ref<boolean>(false);
  const currentTheme = ref<"light" | "dark" | "auto">("auto");
  const user = ref<number | null>(null);
  // 切换主题 系统主题 亮色主题 暗色主题
  const toggleTheme = (mode: "auto" | "light" | "dark") => {
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
      localStorage.setItem(`theme-${user.value}`, mode);
      // console.log("user.value:", user.value);
    }
  };

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
  const applyCustomTheme = (theme: string) => {
    if (theme.startsWith("#")) {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = theme;
      document.documentElement.style.setProperty("--bgColor1", theme);
    } else {
      document.body.style.backgroundImage = `url(${theme})`;
      document.body.style.backgroundSize = "100% 100%";
      document.body.style.backgroundRepeat = "no-repeat";
      document.documentElement.style.setProperty("--bgColor1", theme);
      document.documentElement.style.setProperty("--color-bg4", theme);
      document.documentElement.style.setProperty("--color-bg3", theme);
    }
  };

  const loadTheme = () => {
    const userStore = useUserStore();
    const userFromStore = userStore.user.uuid;

    // console.log("用户ID:", userFromStore);

    if (!userFromStore) {
      // console.log("用户未登录");
      toggleTheme("light");
      return;
    }
    user.value = userFromStore;
    // console.log("用户ID:", user.value);

    const savedTheme = localStorage.getItem(`theme-${user.value}`) as
      | "auto"
      | "light"
      | "dark"
      | string
      | null;

    if (savedTheme) {
      if (["auto", "light", "dark"].includes(savedTheme)) {
        toggleTheme(savedTheme as "auto" | "light" | "dark");
      }
    } else {
      toggleTheme("light");
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
    // console.log("用户ID:", userId);
  };

  const clearUserTheme = () => {
    if (user.value) {
      localStorage.removeItem(`theme-${user.value}`);
      toggleTheme("light");
    }
  };

  onMounted(() => {
    loadTheme();
  });

  onUnmounted(() => {
    removeSystemThemeChangeListener();
  });

  return {
    applyCustomTheme,
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
