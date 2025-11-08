import mockData from "../mock/mock";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import axiosConfig from "../utils/request";
import { apiUrl } from "../config";
import type { FormInstance, FormRules } from "element-plus";
import { useUserStore } from "../store/userStore";
import { Document, Camera, Edit } from "@element-plus/icons-vue";
import BlogIcon from "../components/icon/Blog.vue";
import PhotographyIcon from "../components/icon/Photography.vue";
import NoteIcon from "../components/icon/Note.vue";
export default function useHome(uploadRef: any) {
  const router = useRouter();
  const userId = ref<number | null>(null);
  const userStore = useUserStore();
  const user = computed(() => userStore.user);
  // 弹窗相关
  const dialogVisible = ref(false);
  const currentType = ref<"essay" | "photography" | "notes">("essay");
  const formRef = ref<FormInstance>();
  const imageUrl = ref("");
  const articleTotal = ref(0);
  const photographyTotal = ref(0);
  const noteTotal = ref(0);
  let showUploadButton = ref(false);
  const formData = ref({
    title: "",
    content: "",
    image: "",
    label: "",
    size: 0,
  });
  const totalVisits = ref(0);
  const todayVisits = ref(0);
  const { totalVisits: actualTotalVisits, todayVisits: actualTodayVisits } =
    mockData;

  userId.value = user.value?.id || null;
  let wall = () => {
    router.push("/messagewall/messages?category=全部");
  };

  const incrementCounter = (target: number, current: any) => {
    let intervalId = setInterval(() => {
      if (current.value < target) {
        current.value += 1;
      } else {
        clearInterval(intervalId);
      }
    }, 1); // 每毫秒增加一次
  };
  let designdoc = () => {
    window.open(
      "https://js.design/f/TrQmml?p=wwoaF4WR66&mode=design",
      "_blank"
    );
  };
  let official = () => {
    window.open("https://yike.design/", "_blank");
  };
  let github = () => {
    window.open("https://github.com/ecaps1038/yike-design-dev", "_blank");
  };
  let download = () => {
    router.push("/download");
    console.log(1);
  };

  const submitUpload = () => {
    if (uploadRef.value) {
      ElMessage.info({
        message: "正在上传...",
        duration: 0, // 不自动关闭
      }); // 开始加载
      uploadRef.value.submit();
    } else {
      ElMessage.error("上传组件未正确初始化，请稍后再试");
    }
  };

  const handleChange = (file: File, fileList: File[]) => {
    showUploadButton.value = fileList.length > 0;
    ElMessage.info(`已选择图片：${file.name}`);
  };
  const dialogTitle = computed(() => {
    const titles = {
      essay: "新增博客文章",
      photography: "新增摄影图库",
      notes: "新增随笔随记",
    };
    return titles[currentType.value];
  });

  // // 表单验证规则
  // const rules = computed<FormRules>(() => {
  //   const baseRules: FormRules = {};
  //   baseRules.title = [
  //     { required: true, message: "请输入标题", trigger: "blur" },
  //     { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  //   ];
  //   baseRules.image = [
  //     { required: true, message: "请上传图片", trigger: "change" },
  //   ];
  //   baseRules.content = [
  //     { required: true, message: "请输入内容", trigger: "blur" },
  //     {
  //       min: 5,
  //       max: 500,
  //       message: "长度在 5 到 500 个字符",
  //       trigger: "blur",
  //     },
  //   ];
  //   if (currentType.value === "essay") {
  //     baseRules.label = [
  //       { required: true, message: "请输入标签", trigger: "blur" },
  //     ];
  //   }
  //   return baseRules;
  // });

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
    formData.value.size = file.size;
    // 判断如果已经上传了图片 再次上传一张新图片 把旧图片删除
    deleteNewImage(true);
    return isAllowedType && isLt5M;
  };

  const handleSuccess = async (response: any, file: File) => {
    const fullPath = response.data.image;
    const filename = fullPath.split("/").pop();
    const signedUrlResponse = await axiosConfig.get(
      `${apiUrl}/admin/upload/image/sign?filename=${filename}`
    );
    imageUrl.value = signedUrlResponse.data.data.url;
    formData.value.image = imageUrl.value;
    ElMessage.success(signedUrlResponse.data.message);
    // 清空文件列表
    uploadRef.value.clearFiles();
    // 隐藏上传按钮
    showUploadButton.value = false;
    // ... 处理逻辑
    ElMessage.closeAll(); // 关闭 loading
  };
  // 假设用户已经上传了图片 再次上传一张新图片 把旧图片删除
  const deleteNewImage = async (isReupload: boolean = false) => {
    try {
      if (!imageUrl.value) {
        // 如果 imageUrl 为空，直接返回
        return;
      }
      // 提取图片名称
      const urlParts = imageUrl.value.split("/");
      if (urlParts.length === 0) {
        console.warn("imageUrl 格式不正确:", imageUrl.value);
        return;
      }
      const imageName = urlParts.pop();
      if (!imageName) {
        console.warn("无法从 imageUrl 提取图片名称:", imageUrl.value);
        return;
      }
      // 发送删除请求
      await axiosConfig.delete(`${apiUrl}/admin/upload/image/${imageName}`);
      // 清空 imageUrl
      imageUrl.value = "";
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

  // 处理添加按钮点击
  function handleAdd(type: "essay" | "photography" | "notes") {
    currentType.value = type;
    dialogVisible.value = true;
  }

  // 处理关闭弹窗
  function handleClose() {
    deleteNewImage(false);
    dialogVisible.value = false;
    // 清除表单数据
    formData.value = {
      title: "",
      content: "",
      label: "",
      image: "",
      size: 0,
    };
    // 重置表单验证状态
    formRef.value?.resetFields();
  }

  async function handleSubmit() {
    try {
      // 检查用户是否登录
      if (!userId.value) {
        ElMessage.error("请先登录");
        return;
      }

      // 检查图片是否上传
      if (!formData.value.image) {
        ElMessage.error("请上传图片");
        return;
      }

      // 验证表单
      await formRef.value?.validate();

      // 构建请求体
      const payload = {
        image: formData.value.image,
        userId: userId.value,
        size: formData.value.size,
        content: formData.value.content.trim(),
        ...(currentType.value !== "photography" && {
          title: formData.value.title.trim(),
        }),
        ...(currentType.value === "essay" && {
          label: formData.value.label.trim(),
        }),
      };

      // 发送请求
      let responseMessage = "";
      const endpoints = {
        essay: "/admin/article",
        photography: "/admin/photography",
        notes: "/admin/note",
      };

      await axiosConfig.post(endpoints[currentType.value], payload);
      responseMessage = `创建${
        currentType.value === "essay"
          ? "博客文章"
          : currentType.value === "photography"
          ? "摄影作品"
          : "随笔随记"
      }成功`;

      // 重置表单和状态
      dialogVisible.value = false;
      formData.value = {
        title: "",
        content: "",
        label: "",
        image: "",
        size: 0,
      };
      imageUrl.value = "";
      await getCount();
      ElMessage.success(responseMessage);
    } catch (error) {
      console.error("创建失败", error);
      ElMessage.error("创建失败，请重试");
    } finally {
      formRef.value?.resetFields();
    }
  }

  async function getCount() {
    try {
      const [
        responseArticleCount,
        responsePhotographyCount,
        responseNoteCount,
      ] = await Promise.all([
        axiosConfig.get("/admin/article", {
          params: { userId: userId.value },
        }),
        axiosConfig.get("/admin/photography", {
          params: { userId: userId.value },
        }),
        axiosConfig.get("/admin/note", {
          params: { userId: userId.value },
        }),
      ]);

      articleTotal.value = responseArticleCount.data.data.pagination.total;
      photographyTotal.value =
        responsePhotographyCount.data.data.pagination.total;
      noteTotal.value = responseNoteCount.data.data.pagination.total;
    } catch (error) {
      console.error("获取数量失败", error);
      ElMessage.error("获取数量失败，请稍后再试");
    }
  }

  onMounted(() => {
    getCount();
    incrementCounter(actualTotalVisits, totalVisits);
    incrementCounter(actualTodayVisits, todayVisits);
  });

  // 内容类型配置
  const contentTypes: Array<{
    type: "essay" | "photography" | "notes";
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    buttonType: string;
    countLabel: string;
  }> = [
    {
      type: "essay",
      title: "博客文章",
      description: "记录生活点滴",
      icon: BlogIcon,
      iconColor: "text-primary",
      buttonType: "primary",
      countLabel: "篇文章",
    },
    {
      type: "photography",
      title: "摄影图库",
      description: "定格美好瞬间",
      icon: PhotographyIcon,
      iconColor: "text-success",
      buttonType: "success",
      countLabel: "张照片",
    },
    {
      type: "notes",
      title: "随笔随记",
      description: "随想随心记录",
      icon: NoteIcon,
      iconColor: "text-warning",
      buttonType: "warning",
      countLabel: "篇随笔",
    },
  ];

  // 获取对应类型的数量
  const getTotalCount = (type: string) => {
    const counts = {
      essay: articleTotal.value,
      photography: photographyTotal.value,
      notes: noteTotal.value,
    };
    return counts[type as keyof typeof counts];
  };

  return {
    wall,
    designdoc,
    official,
    github,
    download,
    ArrowRight,
    todayVisits,
    totalVisits,
    submitUpload,
    handleSuccess,
    contentTypes,
    handleSubmit,
    handleClose,
    getTotalCount,
    handleAdd,
    beforeUpload,
    handleChange,
    currentType,
    imageUrl,
    showUploadButton,
    dialogTitle,
    dialogVisible,
    formData,

    userId,
  };
}
