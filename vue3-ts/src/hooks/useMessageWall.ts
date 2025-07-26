import { ref, onMounted, watch, computed, defineProps } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElDrawer, ElMessageBox } from "element-plus";
import { Plus, Edit, SuccessFilled } from "@element-plus/icons-vue";
import axiosConfig from "../utils/request";
import { apiUrl } from "../config";
import { messageCategories } from "../utils/message";
import {
  HeartOutlined,
  DeleteOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "../store/userStore";
export default function useMessageWall() {
  const props = defineProps({
    tab: {
      type: String,
      default: "messages",
    },
    category: {
      type: String,
      default: null,
    },
  });
  const predefinedColors = [
    { id: 1, color: "#FFEBEE" }, // 浅红色
    { id: 2, color: "#E8F5E9" }, // 浅绿色
    { id: 3, color: "#FFF3E0" }, // 浅橙色
    { id: 4, color: "#ECEFF1" }, // 浅灰色
    { id: 5, color: "#E3F2FD" }, // 浅蓝色
    { id: 6, color: "#FFF8E1" }, // 浅黄色
    { id: 7, color: "#F3E5F5" }, // 浅紫色
    { id: 8, color: "#E1F5FE" }, // 浅青色
    { id: 9, color: "#E8EAF6" }, // 浅薰衣草色 (调整 id 为 9)
    { id: 10, color: "#FBE9E7" }, // 浅珊瑚色
    { id: 11, color: "#FFF9C4" }, // 浅米色
    { id: 12, color: "#F1F8E9" }, // 浅薄荷色
    { id: 13, color: "#E0F7FA" }, // 浅天蓝色
    { id: 14, color: "#F3E5F5" }, // 浅粉色 (调整为唯一颜色)
    { id: 15, color: "#FFCDD2" }, // 浅桃红色
    { id: 16, color: "#C8E6C9" }, // 浅草绿色
    { id: 17, color: "#FFECB3" }, // 浅金黄色
    { id: 18, color: "#B3E5FC" }, // 浅湖蓝色
    { id: 19, color: "#D1C4E9" }, // 浅紫罗兰色
    { id: 20, color: "#FFFDE7" }, // 浅奶油色
    { id: 21, color: "#F0F4C3" }, // 浅柠檬色
    { id: 22, color: "#FFF176" }, // 浅金色
    { id: 23, color: "#FFAB91" }, // 浅珊瑚红色
    { id: 24, color: "#B2DFDB" }, // 浅薄荷绿色
    { id: 25, color: "#ADD8E6" }, // 浅蓝色 (新增颜色)
    { id: 26, color: "#FFFFE0" }, // 浅黄色 (新增颜色)
    { id: 27, color: "#F0FFF0" }, // 浅绿色 (新增颜色)
    { id: 28, color: "#F0E68C" }, // 浅橄榄色 (新增颜色)
    { id: 29, color: "#FFD700" }, // 金色 (新增颜色)
    { id: 30, color: "#90EE90" }, // 浅绿色 (新增颜色)
  ];
  const handleColorSelect = (color: { id: number; color: string }) => {
    if (isEditable.value) {
      if (checkColorContrast(color.color)) {
        messageForm.value.backgroundColor = color.color;
        updatePreviewBackgroundColor(color.color);
      }
    }
  };
  const updatePreviewBackgroundColor = (color: string) => {
    const previewElement = document.querySelector(".message-content");
    if (previewElement && previewElement instanceof HTMLElement) {
      previewElement.style.backgroundColor = color;
    }
  };

  const checkColorContrast = (backgroundColor: string) => {
    const text_color = getTextColor(backgroundColor);
    if (text_color === "#000000" && backgroundColor === "#FFFFFF") {
      ElMessage.warning("当前颜色对比度过低，请选择其他颜色");
      return false;
    }
    return true;
  };
  const userStore = useUserStore();
  // 合并后的留言表单数据
  const messageForm = ref<{
    id: string | null;
    name: string;
    content: string;
    userId: number | null;
    category: string | null;
    likesCount: number;
    date: string;
    backgroundColor: string;
    nicknameColor?: string; // 可选属性，用于存储用户的昵称颜色
  }>({
    id: null,
    name: userStore.user?.nickname || "",
    content: "",
    userId: null,
    category: null,
    likesCount: 0,
    date: "",
    backgroundColor: predefinedColors[0].color,
    nicknameColor: "",
  });

  // 是否为编辑模式
  const isEdit = ref<boolean>(false);
  const messages = ref<
    {
      id: string;
      content: string;
      name: string;
      backgroundColor: string;
      userId: number;
      category: string | null;
      likesCount: number;
      isLiked: boolean;
      date: string;
      nicknameColor?: string;
    }[]
  >([]);

  const tabs = [
    {
      id: "messages",
      title: "留言墙",
    },
  ];
  const commentCounts = ref<{ [key: string]: number }>({});
  const route = useRoute();
  const router = useRouter();
  const activeTab = ref<string>(
    route.params.tab?.toString() || props.tab || "messages"
  );
  const showPhotoDrawer = ref(false);
  const activeCategory = ref<string>(route.params.category?.toString() || "");
  const showMessageDrawer = ref<boolean>(false);
  const imageUrl = ref<string | null>(null);
  const userId = ref<number | null>(null);
  const reportedMessages = ref<Set<string>>(new Set<string>());
  const user = computed(() => userStore.user);
  const contentRef = ref<HTMLDivElement>();
  userId.value = user.value?.uuid || null;
  const search = ref("");

  const updateContent = (e: Event) => {
    const target = e.target as HTMLDivElement;
    messageForm.value.content = target.innerText;
  };

  const getFilteredItems = (items: any[], category: string | null) => {
    if (!category || category === "全部") {
      return items;
    }
    return items.filter((item) => item.category === category);
  };

  const filteredMessages = computed(() => {
    let filtered = messages.value;
    // console.log(filtered);

    if (activeCategory.value !== "全部") {
      filtered = filtered.filter(
        (message) => message.category === activeCategory.value
      );
    }
    if (search.value) {
      const keyword = search.value.toLowerCase();
      filtered = filtered.filter(
        (message) =>
          message.content.toLowerCase().includes(keyword) ||
          message.name.toLowerCase().includes(keyword) ||
          (message.category && message.category.toLowerCase().includes(keyword))
      );
    }
    return filtered;
  });
  const handleSearch = () => {
    // 使用lodash来处理频繁的搜索
  };
  const getTextColor = (backgroundColor: string) => {
    // 将背景色转换为RGB值
    const hex = backgroundColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 根据背景亮度返回对应的文字颜色
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const textColor = computed(() => {
    return getTextColor(messageForm.value.backgroundColor);
  });

  const handleSelectTag = (category: any) => {
    if (!isEditable.value || category.id === "全部") return;
    messageForm.value.category = category.id;
  };

  // 获取留言墙
  const fetchWallData = async (category?: string, currentPage: number = 1) => {
    try {
      const params: any = {};
      if (category) {
        params.category = category;
      }
      const wallResponse = await axiosConfig.get("/admin/wall", { params });

      if (wallResponse.data.status) {
        if (currentPage === 1) {
          messages.value = wallResponse.data.data.walls.map((wall: any) => ({
            id: wall.id.toString(),
            content: wall.content,
            name: wall.name,
            userId: wall.userId,
            category: wall.category,
            likesCount: wall.likesCount || 0,
            isLiked: false,
            date: wall.createdAt,
            backgroundColor: wall.backgroundColor,
            nicknameColor: userStore.user?.nicknameColor || "#000000", // 使用用户的昵称颜色
          }));

          // 获取每个留言的评论数据
          // 使用 Promise.all 并行获取所有评论数量
          const counts = await Promise.all(
            messages.value.map((message) => getCommentCount(message.id))
          );
          // 将获取到的评论数量存储到 commentCounts 中
          messages.value.forEach((message, index) => {
            commentCounts.value[message.id] = counts[index];
          });
        }
      }
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };

  onMounted(() => {
    fetchWallData();
    if (route.params.tab) {
      activeTab.value = route.params.tab as string;
    }
    if (route.query.category) {
      activeCategory.value = route.query.category as string;
      fetchWallData(route.query.category as string);
    } else {
      fetchWallData();
    }
    // 从 localStorage 加载已举报的留言 ID
    const reportedSet = new Set<string>(
      JSON.parse(localStorage.getItem("reportedMessages") || "[]") as string[]
    );
    reportedMessages.value = reportedSet;
    // 确保 userId 正确获取
    userId.value = user.value?.id || null;
  });

  const handleMessageClick = (message: any) => {
    const categoryId = message.id;
    activeCategory.value = categoryId;
    router.replace({
      name: "messagewall",
      params: { tab: "messages" },
      query: { category: categoryId },
    });
  };

  const changeTab = (tabId: string) => {
    activeTab.value = tabId;
    const query = route.query.id ? { id: route.query.id } : {};
    router.replace({ name: "messagewall", params: { tab: tabId }, query });
  };

  const likeMessage = async (messageId: string) => {
    try {
      const response = await axiosConfig.post("/admin/likeswall/like", {
        wallsId: messageId,
        userId: userId.value,
      });
      if (response.data.status) {
        const index = messages.value.findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
          messages.value[index].isLiked = response.data.data.isLiked;
          messages.value[index].likesCount = response.data.data.likeCount;
        }
      }
      ElMessage.success(response.data.message);
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  const chatMessage = (messageId: string) => {
    router.push({
      name: "comment/chat",
      params: { messageId },
    });
  };
  // 通知该墙主撕掉留言墙
  const reportQQ = async (messageId: string) => {
    try {
      const response = await axiosConfig.post(
        `/admin/wall/delete/${messageId}`
      );
      ElMessage.success(response.data.message);
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  const reportMessage = async (messageId: string) => {
    // 从 localStorage 加载已举报的留言 ID
    const reportedSet = new Set<string>(
      JSON.parse(localStorage.getItem("reportedMessages") || "[]") as string[]
    );
    // 检查用户是否已经举报过该留言
    if (reportedSet.has(messageId)) {
      ElMessage.warning("你已经举报过该留言，请勿重复举报");
      return;
    }
    try {
      await axiosConfig.post(`/admin/wall/report/${messageId}`, {
        userId: userId.value,
        content: "举报内容: 该留言存在违规行为,请管理员尽快处理",
      });
      // 将该留言 ID 添加到已举报集合中
      reportedSet.add(messageId);
      reportedMessages.value = reportedSet;
      // 将更新后的 Set 存储到 localStorage
      localStorage.setItem(
        "reportedMessages",
        JSON.stringify(Array.from(reportedSet))
      );
      // 提示用户举报成功
      ElMessage.success("举报成功,感谢你的举报");
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  const deleteMessage = async (messageId: string) => {
    try {
      // 弹出确认对话框
      await ElMessageBox.confirm(
        "确定要删除这条留言吗？此操作将删除留言及其所有评论。",
        "提示",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      );

      // 删除留言下的所有评论
      await deleteCommentsByWallId(messageId);

      // 删除留言
      const response = await axiosConfig.delete(`/admin/wall/${messageId}`);
      const index = messages.value.findIndex((msg) => msg.id === messageId);
      if (index !== -1) {
        messages.value.splice(index, 1);
      }

      ElMessage.success(response.data.message);
      showMessageDrawer.value = false;
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };

  // 根据留言ID删除所有评论
  const deleteCommentsByWallId = async (wallId: string) => {
    try {
      const response = await axiosConfig.delete(
        `/admin/comment/comment/wall/${wallId}`
      );
      if (response.data.status) {
        ElMessage.success("留言下的评论已全部删除");
      }
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };

  // 显示添加留言抽屉
  const showAddMessage = () => {
    isEdit.value = false;
    messageForm.value = {
      id: null, // 新增时 id 为 null
      name: userStore.user?.nickname || "", // 使用当前用户的昵称
      content: "",
      userId: userId.value, // 设置当前用户 ID
      category: messageCategories[0].id, // 默认选择第一个分类
      likesCount: 0,
      date: "",
      backgroundColor: predefinedColors[0].color,
      nicknameColor: userStore.user?.nicknameColor || "#000000", // 使用用户的昵称颜色
    };
    showMessageDrawer.value = true;
  };

  // 显示编辑留言抽屉
  const handleEditMessage = (message: any) => {
    messageForm.value = {
      id: message.id,
      name: message.name,
      content: message.content,
      userId: message.userId,
      category: message.category,
      likesCount: message.likesCount,
      date: message.date,
      backgroundColor: message.backgroundColor,
      nicknameColor: message.nicknameColor || "#000000", // 使用用户的昵称颜色
    };

    isEdit.value = true;
    // 如果是创建者则可以编辑,否则只能查看
    if (userId.value === message.userId) {
      router.push({
        name: "messagewall",
        // 拿到当前留言的 分类
        params: { tab: "messages" },
        query: { category: message.category, id: message.id },
      });
    }
    showMessageDrawer.value = true;
  };

  const isEditable = computed(() => {
    // 新增模式下始终可编辑
    if (!messageForm.value.id) {
      return true;
    }
    // 编辑模式下只有创建者可编辑
    return userId.value === messageForm.value.userId;
  });

  // 关闭抽屉
  const handleCloseDrawer = async () => {
    showMessageDrawer.value = false;
    resetMessageForm();
    messageForm.value = {
      id: null,
      name: "",
      content: "",
      userId: null,
      category: messageCategories[0].id,
      likesCount: 0,
      date: "",
      backgroundColor: predefinedColors[0].color,
    };
    router.push({
      name: "messagewall",
      params: { tab: "messages" },
      query: { category: activeCategory.value },
    });
  };
  // 统一的提交方法
  const handleSubmit = async () => {
    try {
      if (!messageForm.value.content) {
        ElMessage.error("请输入留言内容");
        return;
      }
      if (!messageForm.value.name) {
        ElMessage.error("请输入留言签名");
        return;
      }
      if (!messageForm.value.category) {
        ElMessage.error("请选择留言分类");
        return;
      }
      if (isEdit.value) {
        // 编辑模式
        await axiosConfig.put(`/admin/wall/${messageForm.value.id}`, {
          content: messageForm.value.content,
          name: messageForm.value.name,
          category: messageForm.value.category,
          backgroundColor: messageForm.value.backgroundColor,
        });

        const index = messages.value.findIndex(
          (msg) => msg.id === messageForm.value.id
        );
        if (index !== -1) {
          messages.value[index] = {
            ...messages.value[index],
            content: messageForm.value.content,
            name: messageForm.value.name,
            category: messageForm.value.category,
            backgroundColor: messageForm.value.backgroundColor,
          };
        }
      } else {
        // 新增模式
        if (userId.value === null) {
          ElMessage.error("用户ID为空，请重试");
          return;
        }

        const payload = {
          content: messageForm.value.content,
          name: messageForm.value.name,
          userId: userId.value as number, // 确保 userId 不为 null
          category: messageForm.value.category,
          likesCount: 0,
          date: formatDate(new Date().toString()),
          backgroundColor: messageForm.value.backgroundColor,
        };
        const response = await axiosConfig.post("/admin/wall", payload);
        if (response.data.status) {
          messages.value.push({
            id: response.data.data.id, // 使用后端返回的 ID
            ...payload,
            isLiked: false,
          });
        }
      }

      handleCloseDrawer();
      // 刷新数据
      fetchWallData();
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };

  const resetMessageForm = () => {
    isEdit.value = false;
    imageUrl.value = null;
  };

  watch(
    () => route.params.tab,
    (newTab) => {
      if (newTab) {
        activeTab.value = newTab as string;
      }
    }
  );

  watch(
    () => route.params.category,
    (newCategory) => {
      if (newCategory) {
        activeCategory.value = newCategory as string;
      }
    }
  );

  // 定义时间转换函数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  const getCommentCount = async (wallId: string) => {
    try {
      const response = await axiosConfig.get(`/admin/comment/count/${wallId}`);
      // 直接返回评论数量
      return response.data.data.count;
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  };
  return {
    props,
    predefinedColors,
    messageForm,
    isEdit,
    messages,
    tabs,
    route,
    router,
    activeTab,
    activeCategory,
    showMessageDrawer,
    imageUrl,
    userId,
    reportedMessages,
    user,
    contentRef,
    updateContent,
    getFilteredItems,
    filteredMessages,
    getTextColor,
    textColor,
    handleSelectTag,
    fetchWallData,
    handleMessageClick,
    changeTab,
    search,
    handleSearch,
    likeMessage,
    reportMessage,
    deleteMessage,
    showAddMessage,
    handleEditMessage,
    isEditable,
    handleCloseDrawer,
    handleSubmit,
    resetMessageForm,
    formatDate,
    messageCategories,
    chatMessage,
    Plus,
    Edit,
    apiUrl,
    SuccessFilled,
    HeartOutlined,
    DeleteOutlined,
    MessageOutlined,
    ElDrawer,
    showPhotoDrawer,
    commentCounts,
    handleColorSelect,
    reportQQ,
  };
}
