import { Search, Message } from "@element-plus/icons-vue";
import { ref, computed, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import axiosConfig from "../utils/request";
import { useUserStore } from "../store/userStore";
import { useSearchStore } from "../store/searchStore";

export default function useHeader() {
  const router = useRouter();
  const route = useRoute();
  const searchStore = useSearchStore();
  const userStore = useUserStore();
  const user = computed(() => userStore.user);

  // 状态管理
  const isSearchActive = ref(false);
  const isScrollingPaused = ref(false);
  const drawerVisible = ref(false);
  const direction = ref("rtl");
  const size = ref("30%");
  const showInfoCard = ref(false);
  const updates = ref<Update[]>([]);
  const showDialog = ref(false);
  const newUpdate = ref({
    title: "",
    content: "",
    role: user.value?.role || "admin",
  });

  // 接口定义
  interface Update {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    formattedCreatedAt: string;
  }

  // 封装导航函数
  const navigateToSetting = (tab: string) => {
    const currentPath = route.path;
    const targetPath = `/setting/${tab}`;

    if (currentPath !== targetPath) {
      router.push({ path: targetPath });
    } else {
      ElMessage.info(`您已经在${getTabName(tab)}页面`);
    }
  };

  // 获取标签页名称（用于提示）
  const getTabName = (tab: string) => {
    const names: { [key: string]: string } = {
      personals: "个人资料",
      securitys: "账号安全",
      likes: "我的点赞",
      modes: "模式选择",
      languages: "语言设置",
    };
    return names[tab] || "该设置";
  };

  // 导航处理 - 使用封装函数
  const changeSetting = () => navigateToSetting("personals");
  const viewAccountSecurity = () => navigateToSetting("securitys");
  const goToLikedArticles = () => navigateToSetting("likes");
  const openSettings = () => navigateToSetting("modes");
  const superColorPalette = () => navigateToSetting("languages");

  // 检查当前是否在设置页面
  const isInSettingsPage = computed(() => route.path.startsWith("/setting/"));

  // 消息视图
  const viewMessage = () => {
    drawerVisible.value = true;
  };

  const handleFocus = () => {
    isSearchActive.value = true;
  };

  const viewAvatar = () => {
    if (user.value?.avatar) {
      window.open(user.value.avatar, "_blank");
    } else {
      ElMessage.error("头像未设置");
    }
  };

  // 更新处理
  const handleUpdates = async () => {
    try {
      const response = await axiosConfig.get("/admin/update");
      const updateList = response.data.data.updates;
      updates.value = formatUpdates(updateList);
    } catch (error) {
      handleError("获取更新信息失败", error);
    }
  };

  const addUpdate = async () => {
    try {
      await axiosConfig.post("/admin/update", newUpdate.value);

      await handleUpdates();
      resetNewUpdate();
      ElMessage.success("新增更新信息成功");
      closeDialogs();
    } catch (error) {
      handleError("新增更新信息失败", error);
    }
  };

  const viewsystem = async (id: number) => {
    try {
      const routerData = router.resolve({
        name: "viewsystememail",
        params: { id: id },
      });
      window.open(routerData.href, `updata_${id}`);
      // 关闭抽屉
      drawerVisible.value = false;
    } catch (error) {
      handleError("获取系统信息失败", error);
    }
  };

  // 搜索处理
  const handleSearch = async () => {
    try {
      router.push({
        name: "search",
        query: {
          keyword: searchStore.searchQuery || "",
        },
      });
    } catch (err) {
      handleError("搜索失败,请稍后再试", err);
    }
  };

  // 输入处理
  const handleInput = (e: Event) => {
    searchStore.searchQuery = (e.target as HTMLInputElement).value;
  };

  const handleBlur = () => {
    if (!searchStore.searchQuery) {
      setTimeout(() => {
        isScrollingPaused.value = false;
        isSearchActive.value = false;
      }, 8000);
    }
  };

  const handleMouseEnter = () => {
    isScrollingPaused.value = true;
  };

  const handleMouseLeave = () => {
    isScrollingPaused.value = false;
  };

  // 辅助函数
  const formatUpdates = (updateList: any[]) => {
    return updateList.map((update: any) => ({
      ...update,
      formattedCreatedAt: new Date(update.createdAt).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    }));
  };

  const handleError = (message: string, error: any) => {
    console.error(message, error);
    ElMessage.error(message);
  };

  const resetNewUpdate = () => {
    newUpdate.value = {
      title: "",
      content: "",
      role: user.value?.role || "admin",
    };
  };

  const closeDialogs = () => {
    drawerVisible.value = false;
    showDialog.value = false;
  };

  onMounted(() => {
    handleUpdates();
  });

  // 返回值
  return {
    Search,
    isSearchActive,
    Message,
    openSettings,
    goToLikedArticles,
    searchStore,
    isScrollingPaused,
    text: reactive([
      { name: "加入日间 夜间 夜间模式跟随系统 欢迎来体验" },
      { name: "用户建议与反馈系统已上线，期待您的建议" },
      { name: "搜索功能问题已排除,正常使用即可" },
      { name: "支持多种语言,欢迎使用 如有问题请反馈" },
      { name: "欢迎 使用 Deep Sea 管理系统" },
      { name: "裁剪上传图片功能已上线,请使用" },
    ]),
    handleInput,
    changeSetting,
    viewAccountSecurity,
    handleFocus,
    handleBlur,
    handleMouseEnter,
    handleMouseLeave,
    viewMessage,
    handleSearch,
    direction,
    size,
    addUpdate,
    showDialog,
    showInfoCard,
    newUpdate,
    user,
    drawerVisible,
    updates,
    superColorPalette,
    viewsystem,
    viewAvatar,
    isInSettingsPage,
  };
}
