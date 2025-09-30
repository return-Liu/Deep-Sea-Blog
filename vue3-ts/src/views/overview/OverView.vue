<template>
  <div class="content-container" v-if="content">
    <el-alert
      title="目前仅支持封面图片更换，更多精彩功能正在快马加鞭开发中～"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>
    <div class="content-card" :class="contentType">
      <!-- 文章类型 -->
      <div v-if="contentType === 'essay'" class="essay-content">
        <div class="meta-header">
          <span class="category-tag">{{ content.label }}</span>
          <span class="delete-tag" @click="handleDelete(content.id)">删除</span>
          <span class="essay-date">{{ formatDate(content.createdAt) }}</span>
        </div>
        <h1 class="title">{{ content.title }}</h1>
        <div class="featured-image" v-if="content.image">
          <el-upload
            ref="essayUploadRef"
            class="essay-photo-uploader"
            :action="`${apiUrl}/admin/upload`"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            method="post"
            :data="{ userId: userId }"
            name="image"
            :auto-upload="false"
            @change="handleChange"
          >
            <img
              :title="uploadTip"
              class="photo"
              :src="contentImageUrl"
              alt="博客文章"
              @error="handleImageError"
            />
          </el-upload>
          <div class="upload-overlay" v-if="showUploadButton">
            <div class="upload-actions">
              <div @click="submitUpload('essay')">
                <span>更换图片</span>
              </div>
            </div>
          </div>
        </div>
        <div class="content-text" v-html="formatContent(content.content)"></div>
        <div class="footer-meta">
          <div class="author-info">
            <img
              @click="openAuthorProfile()"
              v-if="user.avatar || defaultAvatar"
              :src="userAvatarUrl"
              :title="'博主头像'"
              class="avatar"
              @error="handleAvatarError"
            />
            <span :style="{ color: user.nicknameColor }">
              博主: {{ user.nickname || "匿名" }}
            </span>
          </div>
          <div class="action-buttons">
            <button v-if="contentType === 'essay'" class="like-btn">
              <HeartOutlined />
              <span class="like-count">{{ content.likesCount }}</span>
            </button>
            <button v-if="contentType === 'essay'" class="views-btn">
              <EyeOutlined />
              <span class="views-count">浏览{{ content.views }}次</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 摄影类型 -->
      <div
        v-else-if="contentType === 'photography'"
        class="photography-content"
      >
        <div class="photo-container">
          <el-upload
            ref="photoUploadRef"
            class="photography-photo-uploader"
            :action="`${apiUrl}/admin/upload`"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            method="post"
            :data="{ userId: userId }"
            name="image"
            :auto-upload="false"
            @change="handleChange"
          >
            <div class="photo-container">
              <el-tooltip content="点击上传新封面" placement="top">
                <img
                  :title="uploadTip"
                  :src="contentImageUrl"
                  class="photo"
                  alt="摄影图库"
                  @error="handleImageError"
                />
              </el-tooltip>

              <span class="date">{{ formatDate(content.createdAt) }}</span>
              <h2 class="photo-title">{{ content.title || "摄影作品" }}</h2>
              <span
                class="photo-delete-tag"
                @click.stop="handleDelete(content.id)"
                >删除</span
              >
              <p class="photo-desc">{{ content.content }}</p>
            </div>
          </el-upload>

          <div class="upload-overlay" v-if="showUploadButton">
            <div class="upload-actions">
              <div @click="submitUpload('photography')">
                <span>更换图片</span>
              </div>
            </div>
          </div>
        </div>
        <div class="exif-data" v-if="content.exif">
          <div class="exif-item" v-for="(val, k) in content.exif" :key="k">
            <span class="exif-label">{{ k }}:</span>
            <span class="exif-value">{{ val }}</span>
          </div>
        </div>
      </div>

      <!-- 笔记类型 -->
      <div v-else-if="contentType === 'notes'" class="notes-content">
        <div class="note-header">
          <h2 class="note-title">{{ content.title }}</h2>
          <span class="note-date">{{ formatDate(content.createdAt) }}</span>
          <span class="note-delete-tag" @click="handleDelete(content.id)"
            >删除</span
          >
        </div>
        <div class="note-image" v-if="content.image">
          <el-upload
            ref="notesUploadRef"
            class="notes-photo-uploader"
            :action="`${apiUrl}/admin/upload`"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            method="post"
            :data="{ userId: userId }"
            name="image"
            :auto-upload="false"
            @change="handleChange"
          >
            <el-tooltip content="点击上传新封面" placement="top">
              <img
                :title="uploadTip"
                :src="contentImageUrl"
                class="photo"
                alt="随笔随记"
                @error="handleImageError"
              />
            </el-tooltip>
          </el-upload>
          <div class="upload-overlay" v-if="showUploadButton">
            <div class="upload-actions">
              <div @click="submitUpload('notes')">
                <span>更换图片</span>
              </div>
            </div>
          </div>
        </div>
        <div class="note-text" v-html="formatContent(content.content)"></div>
        <div class="note-tags">
          <span v-for="tag in content.tags" :key="tag" class="tag">{{
            tag
          }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>正在加载内容...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { EyeOutlined, HeartOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import type { UploadFile } from "element-plus";
import { ElMessage, ElUpload, ElMessageBox } from "element-plus";
import { Upload } from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";
import { format } from "date-fns";
import { apiUrl } from "../../config";
import { useUserStore } from "../../store/userStore";
const { openAuthorProfile } = useUserStore();

// 常量定义
const DEFAULT_AVATAR =
  "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
const TYPE_NAME_MAP = {
  essay: "博客文章",
  photography: "摄影作品",
  notes: "随笔随记",
};
const ENDPOINTS = {
  essay: "/admin/article",
  photography: "/admin/photography",
  notes: "/admin/note",
};
const CONTENT_KEYS = {
  essay: "article",
  photography: "photography",
  notes: "note",
};

// 组合式 API
const router = useRouter();
const userStore = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();

// 引用定义
const essayUploadRef = ref<InstanceType<typeof ElUpload>>();
const photoUploadRef = ref<InstanceType<typeof ElUpload>>();
const notesUploadRef = ref<InstanceType<typeof ElUpload>>();

const originalContent = ref<any>(null);
const showUploadButton = ref<boolean>(false);
const contentType = ref<string>("");
const content = ref<any>(null);
const imageUrl = ref<string>("");
const userId = ref<number | null>(userStore.user?.id || null);

// 计算属性
const defaultAvatar = computed(() => DEFAULT_AVATAR);
const currentTypeText = computed(
  () => TYPE_NAME_MAP[contentType.value as keyof typeof TYPE_NAME_MAP] || "内容"
);
const uploadTip = computed(
  () => `点击上传新封面 - 当前为${currentTypeText.value}封面`
);

// 图片URL计算属性
const contentImageUrl = computed(() => {
  if (!content.value?.image) return defaultAvatar.value;

  // 如果已经是完整URL，直接返回
  if (content.value.image.startsWith("http")) {
    return content.value.image;
  }

  // 否则构造OSS URL（假设OSS允许公开读）
  return `http://deep-seas-oss-cn-beijing.aliyuncs.com/${content.value.image}`;
});

const userAvatarUrl = computed(() => {
  if (!user.value?.avatar) return defaultAvatar.value;

  // 如果已经是完整URL，直接返回
  if (user.value.avatar.startsWith("http")) {
    return user.value.avatar;
  }

  // 否则构造OSS URL（假设OSS允许公开读）
  return `http://deep-seas-oss-cn-beijing.aliyuncs.com/${user.value.avatar}`;
});

// 图片错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar.value;
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = defaultAvatar.value;
};

// 格式化函数
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "yyyy年MM月dd日");
  } catch {
    return dateString;
  }
};

const formatContent = (text: string) => {
  return text || "";
};

// 删除处理
const handleDelete = async (contentId: number) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除这项内容吗？此操作无法撤销。",
      "提示",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const endpoint = ENDPOINTS[contentType.value as keyof typeof ENDPOINTS];
    if (!endpoint) {
      ElMessage.error("不支持的内容类型");
      return;
    }

    const response = await axiosConfig.delete(`${endpoint}/${contentId}`);

    if (content.value?.image) {
      deleteOldImage(content.value.image);
    }

    ElMessage.success(response.data.message);
    router.push({ path: "/share/essay" });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};

// 上传处理
const handleChange = (uploadFile?: UploadFile) => {
  const file = uploadFile?.raw;
  if (!file) return;
  showUploadButton.value = true;
};

const submitUpload = (type: string) => {
  const uploadRefs = {
    essay: essayUploadRef,
    photography: photoUploadRef,
    notes: notesUploadRef,
  };

  const ref = uploadRefs[type as keyof typeof uploadRefs];
  ref.value?.submit();
  showUploadButton.value = false;
};

const beforeUpload = async (file: File) => {
  try {
    await ElMessageBox.confirm(
      `您正在更换${currentTypeText.value}封面图片，原图将被删除，是否继续？`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
  } catch {
    // 用户点击取消或关闭弹窗
    essayUploadRef.value?.clearFiles();
    photoUploadRef.value?.clearFiles();
    notesUploadRef.value?.clearFiles();
    showUploadButton.value = false;
    ElMessage.info(`已取消更换${currentTypeText.value}封面图片`);
    return false;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isAllowedType) {
    ElMessage.error("上传图片只能是 JPG/PNG/WEBP/GIF 格式!");
    return false;
  }

  if (!isLt5M) {
    ElMessage.error("上传图片大小不能超过 5MB!");
    return false;
  }

  if (!userStore.user.uuid) {
    ElMessage.error("ID未找到，请重新登录");
    return false;
  }

  if (content.value?.image) {
    deleteOldImage(content.value.image);
  }

  return true;
};

const deleteOldImage = async (imageUrl: string) => {
  try {
    if (!imageUrl) return;

    // 从URL中提取文件名
    let imageName = "";
    if (imageUrl.startsWith("http")) {
      const url = new URL(imageUrl);
      imageName = url.pathname.substring(1); // 去掉开头的斜杠
    } else {
      imageName = imageUrl;
    }

    if (!imageName) {
      console.warn("无法从 imageUrl 提取图片名称:", imageUrl);
      return;
    }

    const response = await axiosConfig.delete(
      `${apiUrl}/admin/upload/image/${imageName}`
    );
    ElMessage.success(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "删除旧图片失败";
    ElMessage.error(errorMessage);
  }
};

// 自动保存
const autoSaveContent = async () => {
  try {
    if (!userId.value) {
      ElMessage.error("请先登录");
      return;
    }

    if (!content.value?.image) {
      ElMessage.error("图片上传失败");
      return;
    }

    if (contentType.value === "essay") {
      if (!content.value.title?.trim()) {
        ElMessage.error("文章标题不能为空");
        return;
      }
      if (!content.value.label?.trim()) {
        ElMessage.error("文章标签不能为空");
        return;
      }
    } else if (contentType.value === "notes") {
      if (!content.value.title?.trim()) {
        ElMessage.error("随笔标题不能为空");
        return;
      }
    }

    if (!content.value.content?.trim()) {
      ElMessage.error("内容不能为空");
      return;
    }

    const payload = {
      image: content.value.image,
      userId: userId.value,
      ...(contentType.value !== "photography" && {
        title: content.value.title,
      }),
      ...(contentType.value === "essay" && { label: content.value.label }),
      content: content.value.content,
    };

    const id = route.query.id;
    const endpoint = ENDPOINTS[contentType.value as keyof typeof ENDPOINTS];

    if (!endpoint) {
      ElMessage.error("不支持的内容类型");
      return;
    }

    const response = await axiosConfig.put(`${endpoint}/${id}`, payload);
    ElMessage.success(response.data.message);
    originalContent.value = JSON.parse(JSON.stringify(content.value));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "保存失败";
    ElMessage.error(errorMessage);
  }
};

// 生命周期钩子
onMounted(async () => {
  const id = route.query.id;
  const type = route.query.type;

  if (!id || !type || Array.isArray(type)) {
    console.error("Invalid or unsupported query parameters");
    return;
  }

  contentType.value = type as string;

  try {
    const endpoint = `${ENDPOINTS[type as keyof typeof ENDPOINTS]}/${id}`;
    const contentKey = CONTENT_KEYS[type as keyof typeof CONTENT_KEYS];

    const response = await axiosConfig.get(endpoint);
    ElMessage.success(response.data.message);

    if (response?.data?.data) {
      const fetchedContent = response.data.data[contentKey];
      content.value = { ...fetchedContent };
      originalContent.value = JSON.parse(JSON.stringify(fetchedContent));
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
});

const handleSuccess = async (response: any) => {
  const fullPath = response.data.image;
  // 直接使用完整路径
  content.value.image = fullPath;
  ElMessage.success("图片上传成功");

  [essayUploadRef, photoUploadRef, notesUploadRef].forEach((ref) => {
    ref.value?.clearFiles();
  });

  showUploadButton.value = false;

  if (originalContent.value) {
    originalContent.value.image = fullPath;
  }

  await autoSaveContent();
};

function arraysEqual(a: any[], b: any[]): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return JSON.stringify(a.sort()) === JSON.stringify(b.sort());
}
</script>

<style scoped lang="less">
@import "../../base-ui/overview.less";
</style>
