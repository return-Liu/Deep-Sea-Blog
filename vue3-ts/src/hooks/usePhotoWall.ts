import { ref, onMounted, watch, computed, defineProps, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { photoCategories } from "../utils/photo";
import { Plus, Edit, SuccessFilled } from "@element-plus/icons-vue";
import withMaintenanceMode from "../utils/withMaintenanceMode";
import { PhotoForm, photos, isEdit } from "../utils/photostatus";
import { apiUrl } from "../config";
import { DeleteOutlined } from "@ant-design/icons-vue";
import { ElMessage } from "element-plus";
import axiosConfig from "../utils/request";
import { useUserStore } from "../store/userStore";

export default function usePhotoWall(
  props: { tab?: string; category?: string } = {
    tab: "photos",
    category: "全部",
  }
) {
  const tabs = [
    {
      id: "photos",
      title: "照片墙",
    },
  ];
  let showUploadButton = ref(false);
  const showMessageDrawer = ref<boolean>(false);
  const showPhotoDrawer = ref(false);
  const route = useRoute();
  const router = useRouter();
  const activeCategory = ref<string>(route.query.category?.toString() || "");
  const activeTab = ref<string>(
    route.params.tab?.toString() || props.tab || "photos"
  );
  const userId = ref<number | null>(null);
  const search = ref("");
  const uploadRef = ref<any>(null);
  const userStore = useUserStore();
  const user = computed(() => userStore.user);
  userId.value = user.value?.id || null;

  // 下拉刷新和上拉加载相关状态
  const isLoading = ref(false);
  const isRefreshing = ref(false);
  const isNoMore = ref(false);

  const columns = ref(4);
  const showCustomModal = ref(false);
  const errorMessage = ref<string | null>(null);
  const currentPage = ref<number>(1); // 当前页码
  const pageSize = ref<number>(10); // 每页数量
  const total = ref<number>(0); // 总数量

  // 存储照片
  const photoImages = ref("");

  // 切换分页
  const changePage = (newPage: number) => {
    currentPage.value = newPage;
    fetchPhotos(activeCategory.value || undefined);
  }; // 动态计算列数
  const calculateColumns = () => {
    const containerWidth =
      document.querySelector(".photos-main")?.clientWidth || 0;
    columns.value = Math.max(1, Math.floor(containerWidth / 300)); // 每列宽度约为300px
  };
  const cacheKey = computed(() => {
    return `photo-wall-${activeCategory.value}-${search.value}`;
  });

  // 保存缓存数据
  const saveToCache = (photos: any[]) => {
    const cacheData = {
      photos,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey.value, JSON.stringify(cacheData));
  };

  // 获取照片墙列表
  const fetchPhotos = async (category?: string) => {
    try {
      const params: any = {
        currentPage: currentPage.value,
        pageSize: pageSize.value,
      };

      if (category && category !== "全部") {
        params.category = category;
      }

      if (search.value) {
        params.search = search.value;
      }

      const response = await axiosConfig.get(`${apiUrl}/admin/photo`, {
        params,
      });

      const newPhotos = response.data.data.photos.map((photo: any) => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        category: photo.category,
        photoImages: photo.photo,
        userId: photo.userId,
        date: new Date(photo.createdAt),
        loaded: false,
      }));

      const pagination = response.data.data.pagination;
      currentPage.value = pagination.currentPage;
      pageSize.value = pagination.pageSize;
      total.value = pagination.total;
      photos.value = newPhotos;
      isNoMore.value = newPhotos.length < pageSize.value;
      return pagination;
    } catch (error) {
      console.error(error);
      errorMessage.value = "获取照片失败，请稍后重试";
      ElMessage.error("获取照片失败");
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  };

  // 下拉刷新
  const refreshPhotos = async () => {
    if (isRefreshing.value) return;

    isRefreshing.value = true;
    currentPage.value = 1; // 重置为第一页
    await fetchPhotos(activeCategory.value || undefined);
  };

  // 上拉加载更多
  const loadMorePhotos = async () => {
    if (isLoading.value || isNoMore.value || isRefreshing.value) return;

    isLoading.value = true;
    currentPage.value += 1;

    try {
      await fetchPhotos(activeCategory.value || undefined);
    } catch (error) {
      console.error("加载更多图片失败:", error);
      ElMessage.error("加载更多图片失败，请稍后再试");
    } finally {
      isLoading.value = false;
    }
  };

  const handlePhotoClick = (photo: any) => {
    const categoryId = photo.id;
    activeCategory.value = categoryId;
    router.replace({
      name: "photowall",
      params: { tab: "photos" },
      query: { category: categoryId },
    });
  };

  const handleSearch = async () => {
    currentPage.value = 1;
    await fetchPhotos(activeCategory.value || undefined);
  };

  const filteredPhotos = computed(() => {
    let filtered = photos.value;
    if (activeCategory.value && activeCategory.value !== "全部") {
      filtered = filtered.filter(
        (photo) => photo.category === activeCategory.value
      );
    }
    if (search.value) {
      const keyword = search.value.toLowerCase();
      filtered = filtered.filter(
        (photo) =>
          photo.title.toLowerCase().includes(keyword) ||
          photo.description.toLowerCase().includes(keyword) ||
          (photo.category && photo.category.toLowerCase().includes(keyword))
      );
    }

    // 添加动画延迟属性
    return filtered.map((photo, index) => ({
      ...photo,
      delay: index, // 根据索引设置延迟
    }));
  });
  const showAddMessage = () => {
    showMessageDrawer.value = true;
  };

  const isEditable = computed(() => {
    // 新增模式下始终可编辑
    if (!PhotoForm.value.id) {
      return true;
    }
    // 编辑模式下只有创建者可编辑
    return userId.value === PhotoForm.value.userId;
  });

  const beforeUpload = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const isAllowedType = allowedTypes.includes(file.type);
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isAllowedType) {
      ElMessage.error("上传图片只能是 JPG 或 PNG 或 WEBP 或 GIF 格式!");
    }
    if (!isLt5M) {
      ElMessage.error("上传图片大小不能超过 5MB!");
    }
    // 检查 userId 是否存在
    if (!userId.value) {
      ElMessage.error("用户ID未找到，请重新登录");
      return false;
    }
    // 获取文件大小并存储在 formData 中
    PhotoForm.value.userId = userId.value;
    // 判断如果已经上传了图片 再次上传一张新图片 把旧图片删除
    handleDeletePhoto(true);

    return isAllowedType && isLt5M;
  };

  const handleChange = (file: File, fileList: File[]) => {
    showUploadButton.value = fileList.length > 0;
    ElMessage.info(`已选择图片：${file.name}`);
  };

  const handleSuccess = async (response: any, file: File) => {
    const fullPath = response.data.image;
    const filename = fullPath.split("/").pop();
    const signedUrlResponse = await axiosConfig.get(
      `${apiUrl}/admin/upload/image/sign?filename=${filename}`
    );
    PhotoForm.value.photoImages = signedUrlResponse.data.data.url;
    ElMessage.success(signedUrlResponse.data.message);
    uploadRef.value.clearFiles();
    showUploadButton.value = false;
  };

  const handleTagClick = (category: any) => {
    PhotoForm.value.category = category.id;
  };

  const handleDeletePhoto = async (isReupload: boolean = false) => {
    try {
      if (!photoImages.value) {
        // 如果 imageUrl 为空，直接返回
        return;
      }
      // 提取图片名称
      const urlParts = photoImages.value.split("/");
      if (urlParts.length === 0) {
        console.warn("imageUrl 格式不正确:", photoImages.value);
        return;
      }
      const imageName = urlParts.pop();
      if (!imageName) {
        console.warn("无法从 imageUrl 提取图片名称:", photoImages.value);
        return;
      }
      // 发送删除请求
      await axiosConfig.delete(`${apiUrl}/admin/upload/image/${imageName}`);
      // 清空 imageUrl
      photoImages.value = "";
      // 显示成功消息
      if (isReupload) {
        ElMessage.error("旧图片已删除, 已重新上传新图片");
      } else {
        ElMessage.info("已删除未使用的图片,如需重新上传,请点击上传按钮");
      }
    } catch (error) {
      console.error("删除图片失败:", error);
      ElMessage.error("删除失败");
    }
  };

  const submitUpload = () => {
    if (uploadRef.value) {
      ElMessage.info({
        message: "正在上传...",
        duration: 3000,
      }); // 开始加载
      uploadRef.value.submit();
    } else {
      ElMessage.error("上传组件未正确初始化，请稍后再试");
    }
  };
  // 打开自定义模态框
  const handlePhotoView = (photo: any) => {
    viewingPhoto.value = photo;
    showCustomModal.value = true;
  };

  // 关闭自定义模态框
  const closeCustomModal = () => {
    showCustomModal.value = false;
    viewingPhoto.value = null;
  };
  // 处理关闭弹窗
  function handleCloseDrawer() {
    handleDeletePhoto(false);
    showMessageDrawer.value = false;
    PhotoForm.value = {
      id: null,
      title: "",
      description: "",
      category: "",
      photoImages: "",
      userId: null,
      date: new Date(),
    };

    router.push({
      name: "photowall",
      params: { tab: "photos" },
      query: { category: activeCategory.value },
    });
  }

  const handleSubmit = async () => {
    // 提交照片墙表单的逻辑
    try {
      // // 检查必要字段
      // if (!PhotoForm.value.title) {
      //   ElMessage.error("请填写标题");
      //   return;
      // }

      // if (!PhotoForm.value.photoImages) {
      //   ElMessage.error("请上传图片");
      //   return;
      // }

      // if (!PhotoForm.value.category) {
      //   ElMessage.error("请选择分类");
      //   return;
      // }
      // if (!PhotoForm.value.description) {
      //   ElMessage.error("请填写描述");
      //   return;
      // }

      // 如果是编辑模式，检查是否有修改
      if (isEdit.value && PhotoForm.value.id) {
        // 查找原始照片数据
        const originalPhoto = photos.value.find(
          (photo) => photo.id === PhotoForm.value.id
        );
        if (originalPhoto) {
          // 检查数据是否发生变化
          const hasChanged =
            originalPhoto.title !== PhotoForm.value.title ||
            originalPhoto.description !== PhotoForm.value.description ||
            originalPhoto.category !== PhotoForm.value.category ||
            originalPhoto.photoImages !== PhotoForm.value.photoImages;

          if (!hasChanged) {
            ElMessage.info("您尚未修改任何内容");
            return;
          }
        }
      }

      const requestData = {
        photo: PhotoForm.value.photoImages,
        userId: PhotoForm.value.userId,
        title: PhotoForm.value.title,
        category: PhotoForm.value.category,
        description: PhotoForm.value.description,
      };

      let response;
      if (isEdit.value && PhotoForm.value.id) {
        // 编辑模式，发送更新请求
        response = await axiosConfig.put(
          `${apiUrl}/admin/photo/${PhotoForm.value.id}`,
          requestData
        );
      } else {
        // 新增模式，发送创建请求
        response = await axiosConfig.post(`${apiUrl}/admin/photo`, requestData);
      }
      ElMessage.success(response.data.message);
      // 重置表单和状态
      PhotoForm.value = {
        id: null,
        title: "",
        description: "",
        category: "",
        photoImages: "",
        userId: null,
        date: new Date(),
      };
      handleCloseDrawer();
      // 刷新
      currentPage.value = 1;
      fetchPhotos();
    } catch (error) {
      console.error("提交照片墙表单失败:", error);
      ElMessage.error("提交失败，请稍后再试");
    }
  };

  onMounted(() => {
    fetchPhotos();
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    const scrollContainer = document.querySelector(".photos-main"); // 假设照片墙的滚动容器是 .photos-main
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }
  });
  watch(columns, (newVal) => {
    console.log(`当前列数: ${newVal}`);
  });
  const handleScroll = () => {
    const scrollContainer = document.querySelector(".photos-main");
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const threshold = 300; // 提前 300px 加载

    if (
      scrollHeight - scrollTop <= clientHeight + threshold &&
      !isLoading.value &&
      !isNoMore.value
    ) {
      // 预加载下一页
      loadMorePhotos();
    }
  };
  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = photoCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "未分类";
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    if (!date) return "未知日期";
    const d = new Date(date);
    return d.toLocaleDateString("zh-CN");
  };

  const handleImageLoad = (photo: any) => {
    photo.loaded = true;
  };

  const handleImageError = (event: Event, photo?: any) => {
    const img = event.target as HTMLImageElement;
    // 设置默认错误图片
    img.src =
      "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    if (photo) {
      photo.loaded = true;
    }
  };

  // 照片查看
  const showPhotoDialog = ref(false);
  const viewingPhoto = ref<any>(null);

  // 计算抽屉标题
  const drawerTitle = computed(() => {
    if (PhotoForm.value.id && isEditable.value) {
      return "重新点亮你的回忆 · 修改内容、标签与颜色，让它更贴近你的心";
    } else if (PhotoForm.value.id && !isEditable.value) {
      return "欣赏这片回忆墙 · 若发现不合适的内容，请帮助我们维护这片温馨空间";
    } else {
      return "分享你的美好瞬间 · 每一张照片都值得被珍藏，让每一帧画面都成为你的印记。";
    }
  });

  const resetForm = () => {
    PhotoForm.value = {
      id: null,
      title: "",
      description: "",
      category: "",
      photoImages: "",
      userId: userId.value,
      date: new Date(),
    };
    isEdit.value = false;

    // 重置上传组件
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  };

  const handleEditPhoto = (photo: any) => {
    // 如果不是照片的发布者，则只能查看不能编辑
    if (userId.value !== photo.userId) {
      viewingPhoto.value = photo;
      showPhotoDialog.value = true;
      return;
    }

    // 重置表单
    resetForm();

    // 设置表单数据
    PhotoForm.value = {
      id: photo.id,
      title: photo.title || "",
      description: photo.description || "",
      category: photo.category || "",
      photoImages: photo.photoImages || "",
      userId: photo.userId || userId.value,
      date: photo.date || new Date(),
    };

    // 设置编辑状态
    isEdit.value = true;
    closeCustomModal();
    // 如果是创建者则可以编辑,否则只能查看
    if (userId.value === photo.userId) {
      router.push({
        name: "photowall",
        params: { tab: "photos" },
        query: { category: photo.category, id: photo.id },
      });
    }
    showMessageDrawer.value = true;

    console.log("编辑照片数据:", PhotoForm.value); // 调试用
  };

  const DeletePhoto = async (photoId?: string | number) => {
    try {
      const response = await axiosConfig.delete(
        `${apiUrl}/admin/photo/${photoId}`
      );
      ElMessage.success(response.data.message);
      handleCloseDrawer();
      closeCustomModal();
      // 刷新列表
      currentPage.value = 1;
      fetchPhotos();
    } catch (error) {
      console.error("删除图片失败:", error);
      ElMessage.error("删除失败");
    }
  };

  return {
    tabs,
    activeTab,
    photoCategories,
    activeCategory,
    handlePhotoClick,
    PhotoForm,
    search,
    handleSearch,
    showPhotoDrawer,
    showAddMessage,
    Plus,
    Edit,
    SuccessFilled,
    handleCloseDrawer,
    showMessageDrawer,
    filteredPhotos,
    isEdit,
    isEditable,
    userId,
    apiUrl,
    beforeUpload,
    handleChange,
    handleSuccess,
    photoImages,
    handleTagClick,
    DeleteOutlined,
    handleDeletePhoto,
    uploadRef,
    showUploadButton,
    handleSubmit,
    submitUpload,
    formatDate,
    getCategoryName,
    handleImageError,
    handleImageLoad, // 导出图片加载完成处理函数
    columns,
    handlePhotoView,
    handleEditPhoto,
    drawerTitle,
    viewingPhoto,
    showPhotoDialog,
    DeletePhoto,
    // 下拉刷新和上拉加载相关
    isLoading,
    isRefreshing,
    isNoMore,
    refreshPhotos,
    loadMorePhotos,
    errorMessage,
    showCustomModal,
    closeCustomModal,
    pagination: computed(() => ({
      total: total.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    })),
    changePage,
  };
}
