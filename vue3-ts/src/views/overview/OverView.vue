<template>
  <div class="content-detail-container">
    <!-- 功能提示 -->
    <el-alert
      title="目前仅支持封面图片更换，更多精彩功能正在快马加鞭开发中～"
      type="warning"
      :closable="false"
      effect="dark"
      class="feature-alert"
    ></el-alert>

    <!-- 内容区域 -->
    <div class="content-wrapper" v-if="content">
      <!-- 主要内容区域 -->
      <div class="main-content">
        <div class="content-card" :class="contentType">
          <!-- 文章类型 -->
          <div v-if="contentType === 'essay'" class="essay-content">
            <!-- 文章头部 -->
            <div class="content-header">
              <div class="breadcrumb">
                <span class="breadcrumb-item" @click="goBack">
                  <el-icon><ArrowLeft /></el-icon>
                  返回列表
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">{{
                  currentTypeText
                }}</span>
              </div>

              <div class="header-actions">
                <el-button
                  type="primary"
                  :icon="EditOutlined"
                  @click="startEditing"
                  class="edit-btn"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  :icon="DeleteOutlined"
                  @click="handleDelete(content.id)"
                  class="delete-btn"
                  plain
                >
                  删除
                </el-button>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-if="isEditing" class="edit-mode">
              <!-- 标题编辑 -->
              <div class="edit-field">
                <label class="edit-label">文章标题</label>
                <el-input
                  v-model="editData.title"
                  placeholder="请输入文章标题"
                  maxlength="100"
                  show-word-limit
                ></el-input>
              </div>

              <!-- 标签编辑 -->
              <div class="edit-field">
                <label class="edit-label">文章标签</label>
                <el-input
                  v-model="editData.label"
                  placeholder="请输入文章标签"
                  maxlength="20"
                  show-word-limit
                ></el-input>
              </div>

              <!-- 内容编辑 -->
              <div class="edit-field">
                <label class="edit-label">文章内容</label>
                <el-input
                  v-model="editData.content"
                  type="textarea"
                  :rows="15"
                  placeholder="请输入文章内容"
                  resize="vertical"
                ></el-input>
              </div>

              <!-- 编辑操作按钮 -->
              <div class="edit-actions">
                <el-button
                  type="primary"
                  :icon="CheckOutlined"
                  @click="saveEditing"
                  :loading="isSaving"
                >
                  保存
                </el-button>
                <el-button
                  :icon="CloseOutlined"
                  @click="cancelEditing"
                  :disabled="isSaving"
                >
                  取消
                </el-button>
              </div>
            </div>

            <!-- 阅读模式 -->
            <div v-else>
              <!-- 文章元信息 -->
              <div class="content-meta">
                <div class="meta-left">
                  <el-tag class="category-tag" type="primary" effect="light">
                    {{ content.label }}
                  </el-tag>
                  <span class="publish-date">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(content.createdAt) }}
                  </span>
                </div>
                <div class="meta-right">
                  <div class="stat-item">
                    <el-icon><View /></el-icon>
                    <span>{{ content.views || 0 }} 次浏览</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Star /></el-icon>
                    <span>{{ content.likesCount || 0 }} 次点赞</span>
                  </div>
                </div>
              </div>

              <!-- 文章标题 -->
              <h1 class="content-title">{{ content.title }}</h1>

              <!-- 文章封面 -->
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
                  <div class="image-container">
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="content-image"
                    />
                    <div class="image-overlay">
                      <div class="overlay-content">
                        <el-icon><Camera /></el-icon>
                        <span>更换封面</span>
                      </div>
                    </div>
                  </div>
                </el-upload>
                <div v-if="showUploadButton" class="upload-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="submitUpload('essay')"
                    class="update-image-btn"
                  >
                    更换图片
                  </el-button>
                  <el-button
                    type="info"
                    size="small"
                    @click="cancelUpload('essay')"
                    class="cancel-upload-btn"
                  >
                    取消
                  </el-button>
                </div>
              </div>

              <!-- 文章内容 -->
              <div class="content-body">
                <div
                  class="content-text"
                  v-html="formatContent(content.content)"
                ></div>
              </div>

              <!-- 文章底部 -->
              <div class="content-footer">
                <div class="author-info">
                  <div class="author-avatar">
                    <img
                      @click="openAuthorProfile()"
                      v-if="user.avatar || defaultAvatar"
                      v-lazy="user.avatar || defaultAvatar"
                      :title="'博主头像'"
                      class="avatar"
                    />
                  </div>
                  <div class="author-details">
                    <span
                      class="author-name"
                      :style="{ color: user.nicknameColor }"
                    >
                      {{ user.nickname || "匿名" }}
                    </span>
                    <span class="author-role">博主</span>
                  </div>
                </div>

                <div class="action-buttons">
                  <el-button
                    type="primary"
                    :icon="ShareAltOutlined"
                    class="share-btn"
                    @click="handleShare"
                  >
                    分享
                  </el-button>
                  <el-button
                    :icon="HeartOutlined"
                    :type="isLiked ? 'warning' : ''"
                    class="like-btn"
                  >
                    {{ isLiked ? "已点赞" : "点赞" }} ({{
                      content.likesCount || 0
                    }})
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 摄影类型 -->
          <div
            v-else-if="contentType === 'photography'"
            class="photography-content"
          >
            <!-- 摄影头部 -->
            <div class="content-header">
              <div class="breadcrumb">
                <span class="breadcrumb-item" @click="goBack">
                  <el-icon><ArrowLeft /></el-icon>
                  返回列表
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">{{
                  currentTypeText
                }}</span>
              </div>

              <div class="header-actions">
                <el-button
                  type="primary"
                  :icon="EditOutlined"
                  @click="startEditing"
                  class="edit-btn"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  :icon="DeleteOutlined"
                  @click="handleDelete(content.id)"
                  class="delete-btn"
                  plain
                >
                  删除
                </el-button>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-if="isEditing" class="edit-mode">
              <!-- 内容编辑 -->
              <div class="edit-field">
                <label class="edit-label">作品描述</label>
                <el-input
                  v-model="editData.content"
                  type="textarea"
                  :rows="10"
                  placeholder="请输入作品描述"
                  resize="vertical"
                ></el-input>
              </div>

              <!-- 编辑操作按钮 -->
              <div class="edit-actions">
                <el-button
                  type="primary"
                  :icon="CheckOutlined"
                  @click="saveEditing"
                  :loading="isSaving"
                >
                  保存
                </el-button>
                <el-button
                  :icon="CloseOutlined"
                  @click="cancelEditing"
                  :disabled="isSaving"
                >
                  取消
                </el-button>
              </div>
            </div>

            <!-- 阅读模式 -->
            <div v-else>
              <!-- 摄影作品 -->
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
                  <div class="photo-wrapper">
                    <div class="photo-meta-overlay">
                      <h2 class="photo-title">
                        {{ content.title || "摄影作品" }}
                      </h2>
                      <span class="photo-date">{{
                        formatDate(content.createdAt)
                      }}</span>
                    </div>
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="photo-image"
                    />
                    <div class="photo-actions">
                      <el-button
                        type="primary"
                        :icon="CameraOutlined"
                        class="change-photo-btn"
                        @click.stop="submitUpload('photography')"
                      >
                        更换图片
                      </el-button>
                    </div>
                  </div>
                </el-upload>
              </div>

              <!-- 摄影描述 -->
              <div class="photo-description" v-if="content.content">
                <h3 class="description-title">作品描述</h3>
                <p class="description-text">{{ content.content }}</p>
              </div>

              <!-- EXIF信息 -->
              <div class="exif-section" v-if="content.exif">
                <h3 class="exif-title">拍摄信息</h3>
                <div class="exif-grid">
                  <div
                    class="exif-item"
                    v-for="(val, k) in content.exif"
                    :key="k"
                  >
                    <span class="exif-label">{{ k }}</span>
                    <span class="exif-value">{{ val }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 笔记类型 -->
          <div v-else-if="contentType === 'notes'" class="notes-content">
            <!-- 笔记头部 -->
            <div class="content-header">
              <div class="breadcrumb">
                <span class="breadcrumb-item" @click="goBack">
                  <el-icon><ArrowLeft /></el-icon>
                  返回列表
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">{{
                  currentTypeText
                }}</span>
              </div>

              <div class="header-actions">
                <el-button
                  type="primary"
                  :icon="EditOutlined"
                  @click="startEditing"
                  class="edit-btn"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  :icon="DeleteOutlined"
                  @click="handleDelete(content.id)"
                  class="delete-btn"
                  plain
                >
                  删除
                </el-button>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-if="isEditing" class="edit-mode">
              <!-- 标题编辑 -->
              <div class="edit-field">
                <label class="edit-label">随笔标题</label>
                <el-input
                  v-model="editData.title"
                  placeholder="请输入随笔标题"
                  maxlength="100"
                  show-word-limit
                ></el-input>
              </div>

              <!-- 内容编辑 -->
              <div class="edit-field">
                <label class="edit-label">随笔内容</label>
                <el-input
                  v-model="editData.content"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入随笔内容"
                  resize="vertical"
                ></el-input>
              </div>

              <!-- 编辑操作按钮 -->
              <div class="edit-actions">
                <el-button
                  type="primary"
                  :icon="CheckOutlined"
                  @click="saveEditing"
                  :loading="isSaving"
                >
                  保存
                </el-button>
                <el-button
                  :icon="CloseOutlined"
                  @click="cancelEditing"
                  :disabled="isSaving"
                >
                  取消
                </el-button>
              </div>
            </div>

            <!-- 阅读模式 -->
            <div v-else>
              <!-- 笔记元信息 -->
              <div class="note-meta">
                <span class="note-date">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(content.createdAt) }}
                </span>
              </div>

              <!-- 笔记标题 -->
              <h1 class="note-title">{{ content.title }}</h1>

              <!-- 笔记封面 -->
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
                  <div class="image-container">
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="content-image"
                    />
                    <div class="image-overlay">
                      <div class="overlay-content">
                        <el-icon><Camera /></el-icon>
                        <span>更换封面</span>
                      </div>
                    </div>
                  </div>
                </el-upload>
                <div v-if="showUploadButton" class="upload-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="submitUpload('notes')"
                    class="update-image-btn"
                  >
                    更新图片
                  </el-button>
                  <el-button
                    type="info"
                    size="small"
                    @click="cancelUpload('notes')"
                    class="cancel-upload-btn"
                  >
                    取消
                  </el-button>
                </div>
              </div>

              <!-- 笔记内容 -->
              <div class="note-body">
                <div
                  class="note-text"
                  v-html="formatContent(content.content)"
                ></div>
              </div>

              <!-- 笔记标签 -->
              <div class="note-tags" v-if="content.tags && content.tags.length">
                <h3 class="tags-title">标签</h3>
                <div class="tags-container">
                  <el-tag
                    v-for="tag in content.tags"
                    :key="tag"
                    class="tag-item"
                    type="info"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关推荐侧边栏 -->
      <div class="related-content">
        <h3 class="related-title">
          <el-icon><Star /></el-icon>
          相关推荐
        </h3>
        <div class="related-list">
          <div
            v-for="item in relatedContent"
            :key="item.id"
            class="related-item"
            @click="goToDetail(item)"
          >
            <div class="related-image-container">
              <img
                :src="getItemImageUrl(item)"
                :alt="item.title"
                class="related-image"
                @error="handleRelatedImageError"
              />
              <div class="image-type-tag">
                {{ getContentTypeText(item.type) }}
              </div>
            </div>
            <div class="related-info">
              <h4 class="related-item-title">
                {{ item.title || "无标题" }}
              </h4>
              <p class="related-excerpt">
                {{ getRelatedExcerpt(item.content) }}
              </p>
              <div class="related-meta">
                <span class="related-date">{{
                  formatDate(item.createdAt)
                }}</span>
                <div class="related-stats">
                  <span class="stat">
                    <el-icon><View /></el-icon>
                    {{ item.views || 0 }}
                  </span>
                  <span class="stat">
                    <el-icon><Star /></el-icon>
                    {{ item.likesCount || 0 }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="popular-tags">
          <h4 class="tags-title">
            <el-icon><PriceTag /></el-icon>
            热门标签
          </h4>
          <div class="tags-list">
            <el-tag
              v-for="tag in popularTags"
              :key="tag"
              class="popular-tag"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 作者信息卡片 -->
        <div class="author-card">
          <div class="author-header">
            <img
              :src="user.avatar || defaultAvatar"
              :alt="user.nickname"
              class="author-avatar-side"
              @click="openAuthorProfile()"
            />
            <div class="author-info-side">
              <h4 class="author-name-side">
                {{ user.nickname || "未知昵称" }}
              </h4>
              <p class="author-bio">{{ user.introduce || "未知介绍" }}</p>
            </div>
          </div>
          <div class="author-stats">
            <div class="stat-item-side">
              <span class="stat-number">{{ articleTotal }}</span>
              <span class="stat-label">博客文章</span>
            </div>
            <div class="stat-item-side">
              <span class="stat-number">{{ photographyTotal }}</span>
              <span class="stat-label">摄影图库</span>
            </div>
            <div class="stat-item-side">
              <span class="stat-number">{{ noteTotal }}</span>
              <span class="stat-label">随笔随机</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="40"><Loading /></el-icon>
        <p>正在加载内容...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  EyeOutlined,
  HeartOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  StarOutlined,
  CameraOutlined,
  ShareAltOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CommentOutlined,
} from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import type { UploadFile } from "element-plus";
import {
  ElMessage,
  ElUpload,
  ElMessageBox,
  ElButton,
  ElTag,
  ElIcon,
  ElInput,
} from "element-plus";
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

// 状态管理
const isEditing = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const editData = ref<any>({
  title: "",
  label: "",
  content: "",
});
const originalContent = ref<any>(null);
const showUploadButton = ref<boolean>(false);
const contentType = ref<string>("");
const content = ref<any>(null);
const imageUrl = ref<string>("");
const userId = ref<number | null>(userStore.user?.id || null);
const isLiked = ref<boolean>(false);
const relatedContent = ref<Array<any>>([]);
const popularTags = ref<Array<string>>([]);
const articleTotal = ref(0);
const photographyTotal = ref(0);
const noteTotal = ref(0);

// 计算属性
const defaultAvatar = computed(() => DEFAULT_AVATAR);
const currentTypeText = computed(
  () => TYPE_NAME_MAP[contentType.value as keyof typeof TYPE_NAME_MAP] || "内容"
);

// 编辑相关方法
const startEditing = () => {
  isEditing.value = true;
  // 如果已经是编辑状态 再次点击有提示
  if (originalContent.value) {
    ElMessage.info("当前已处于编辑状态");
  }
  // 根据内容类型初始化编辑数据
  editData.value = {
    title: content.value.title || "",
    label: content.value.label || "",
    content: content.value.content || "",
  };
};

const cancelEditing = () => {
  isEditing.value = false;
  editData.value = {
    title: "",
    label: "",
    content: "",
  };
  ElMessage.info("已取消编辑");
};

const saveEditing = async () => {
  try {
    isSaving.value = true;

    // 验证必填字段
    if (contentType.value === "essay") {
      if (!editData.value.title?.trim()) {
        ElMessage.error("文章标题不能为空");
        return;
      }
      if (!editData.value.label?.trim()) {
        ElMessage.error("文章标签不能为空");
        return;
      }
    } else if (contentType.value === "notes") {
      if (!editData.value.title?.trim()) {
        ElMessage.error("随笔标题不能为空");
        return;
      }
    }

    if (!editData.value.content?.trim()) {
      ElMessage.error("内容不能为空");
      return;
    }

    const id = route.query.id;
    const endpoint = ENDPOINTS[contentType.value as keyof typeof ENDPOINTS];

    if (!endpoint) {
      ElMessage.error("不支持的内容类型");
      return;
    }

    // 构建更新数据
    const updateData: any = {
      userId: userId.value,
      content: editData.value.content,
    };

    // 根据内容类型添加特定字段
    if (contentType.value === "essay") {
      updateData.title = editData.value.title;
      updateData.label = editData.value.label;
    } else if (contentType.value === "notes") {
      updateData.title = editData.value.title;
    } else if (contentType.value === "photography") {
      // 摄影作品只需要内容
      updateData.content = editData.value.content;
    }

    const response = await axiosConfig.put(`${endpoint}/${id}`, updateData);

    // 更新本地数据
    Object.assign(content.value, updateData);
    originalContent.value = JSON.parse(JSON.stringify(content.value));

    ElMessage.success(response.data.message || "保存成功");
    isEditing.value = false;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "保存失败";
    ElMessage.error(errorMessage);
  } finally {
    isSaving.value = false;
  }
};

// 内容处理方法
const getRelatedExcerpt = (contentText: string) => {
  if (!contentText) return "暂无描述";
  // 移除HTML标签
  const text = contentText.replace(/<[^>]*>/g, "");
  return text.length > 60 ? text.substring(0, 60) + "..." : text;
};

const getContentTypeText = (type: string) => {
  const typeMap: { [key: string]: string } = {
    essay: "博客文章",
    photography: "摄影图库",
    notes: "随笔随记",
  };
  return typeMap[type] || "内容";
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

// 导航函数
const goBack = () => {
  router.back();
};

// 交互函数
const handleShare = () => {
  ElMessage.success("分享功能开发中...");
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
      await deleteOldImage(content.value.image);
    }

    ElMessage.success(response.data.message || "删除成功");
    router.push({ path: "/share/essay" });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "删除失败";
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
  if (ref.value) {
    ref.value.submit();
  }
  showUploadButton.value = false;
};

const cancelUpload = (type: string) => {
  const uploadRefs = {
    essay: essayUploadRef,
    photography: photoUploadRef,
    notes: notesUploadRef,
  };

  const ref = uploadRefs[type as keyof typeof uploadRefs];
  if (ref.value) {
    ref.value.clearFiles();
  }
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

  if (!userStore.user?.uuid) {
    ElMessage.error("ID未找到，请重新登录");
    return false;
  }

  if (content.value?.image) {
    await deleteOldImage(content.value.image);
  }

  return true;
};

const deleteOldImage = async (imageUrl: string) => {
  try {
    if (!imageUrl) return;

    const url = new URL(imageUrl);
    const imageName = url.pathname.split("/").pop();

    if (!imageName) {
      console.warn("无法从 imageUrl 提取图片名称:", imageUrl);
      return;
    }

    const response = await axiosConfig.delete(
      `${apiUrl}/admin/upload/image/${imageName}`
    );
    ElMessage.success(response.data.message || "删除旧图片成功");
  } catch (error: any) {
    console.warn("删除旧图片失败:", error);
    // 不提示错误，继续上传新图片
  }
};

const handleSuccess = async (response: any) => {
  try {
    const fullPath = response.data.image;
    const filename = fullPath.split("/").pop();
    const signedUrlResponse = await axiosConfig.get(
      `${apiUrl}/admin/upload/image/sign?filename=${filename}`
    );

    imageUrl.value = signedUrlResponse.data.data.url;
    content.value.image = imageUrl.value;
    ElMessage.success(signedUrlResponse.data.message || "图片上传成功");

    [essayUploadRef, photoUploadRef, notesUploadRef].forEach((ref) => {
      ref.value?.clearFiles();
    });

    showUploadButton.value = false;

    if (originalContent.value) {
      originalContent.value.image = imageUrl.value;
    }

    await autoSaveContent();
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "图片处理失败";
    ElMessage.error(errorMessage);
  }
};

// 自动保存（用于图片更新）
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

    const id = route.query.id;
    const endpoint = ENDPOINTS[contentType.value as keyof typeof ENDPOINTS];

    if (!endpoint) {
      ElMessage.error("不支持的内容类型");
      return;
    }

    const payload = {
      image: content.value.image,
      userId: userId.value,
    };

    const response = await axiosConfig.put(`${endpoint}/${id}`, payload);
    ElMessage.success(response.data.message || "保存成功");
    originalContent.value = JSON.parse(JSON.stringify(content.value));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "保存失败";
    ElMessage.error(errorMessage);
  }
};

// 相关推荐功能
const LIMIT_PER_PAGE = 6;

const getItemImageUrl = (item: any): string => {
  const DEFAULT_AVATAR =
    "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";

  if (!item.image) return DEFAULT_AVATAR;

  if (item.image.startsWith("http")) {
    return item.image;
  }

  return `http://deep-seas-oss-cn-beijing.aliyuncs.com/${item.image}`;
};

const handleRelatedImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
};

const goToDetail = (item: any) => {
  const routeData = router.resolve({
    name: "overview",
    query: {
      id: String(item.id),
      type: item.type,
    },
  });

  window.open(routeData.href, `_blank`);
};

const extractTagsFromContent = async () => {
  try {
    const allTags = new Set<string>();

    // 获取文章标签
    try {
      const articlesResponse = await axiosConfig.get("/admin/article", {
        params: {
          userId: userId.value,
          limit: 100,
          currentPage: 1,
        },
      });

      const articles = articlesResponse.data.data.articles || [];
      articles.forEach((article: any) => {
        if (article.label && article.label.trim()) {
          allTags.add(article.label.trim());
        }
      });
    } catch (error) {
      console.warn("获取文章标签失败:", error);
    }

    // 获取笔记标签
    try {
      const notesResponse = await axiosConfig.get("/admin/note", {
        params: {
          userId: userId.value,
          limit: 100,
          currentPage: 1,
        },
      });

      const notes = notesResponse.data.data.notes || [];
      notes.forEach((note: any) => {
        if (note.tags && Array.isArray(note.tags)) {
          note.tags.forEach((tag: string) => {
            if (tag && tag.trim()) {
              allTags.add(tag.trim());
            }
          });
        }
      });
    } catch (error) {
      console.warn("获取笔记标签失败:", error);
    }

    // 获取摄影作品的标签
    try {
      const photographyResponse = await axiosConfig.get("/admin/photography", {
        params: {
          userId: userId.value,
          limit: 100,
          currentPage: 1,
        },
      });

      const photographies = photographyResponse.data.data.photography || [];
      const photographyKeywords = [
        "风景",
        "人像",
        "建筑",
        "自然",
        "城市",
        "旅行",
        "夜景",
        "黑白",
      ];

      photographies.forEach((photo: any) => {
        if (photo.title) {
          const title = photo.title.toLowerCase();
          photographyKeywords.forEach((keyword) => {
            if (title.includes(keyword.toLowerCase())) {
              allTags.add(keyword);
            }
          });
        }
      });
    } catch (error) {
      console.warn("获取摄影标签失败:", error);
    }

    const tagsArray = Array.from(allTags);
    const tagFrequency: { [key: string]: number } = {};
    tagsArray.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    const sortedTags = tagsArray
      .sort((a, b) => tagFrequency[b] - tagFrequency[a])
      .slice(0, 12);

    if (sortedTags.length === 0) {
      popularTags.value = [
        "技术",
        "旅行",
        "生活",
        "摄影",
        "读书",
        "思考",
        "美食",
        "编程",
        "设计",
        "音乐",
        "运动",
        "电影",
      ];
    } else {
      popularTags.value = sortedTags;
    }
  } catch (error) {
    console.error("提取标签失败:", error);
    popularTags.value = [
      "技术",
      "旅行",
      "生活",
      "摄影",
      "读书",
      "思考",
      "美食",
      "编程",
      "设计",
      "音乐",
      "运动",
      "电影",
    ];
  }
};

const fetchRelatedContent = async () => {
  try {
    const [responseArticles, responsePhotography, responseNotes] =
      await Promise.all([
        axiosConfig.get("/admin/article", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: 1,
          },
        }),
        axiosConfig.get("/admin/photography", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: 1,
          },
        }),
        axiosConfig.get("/admin/note", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: 1,
          },
        }),
      ]);

    articleTotal.value = responseArticles.data.data.pagination?.total || 0;
    photographyTotal.value =
      responsePhotography.data.data.pagination?.total || 0;
    noteTotal.value = responseNotes.data.data.pagination?.total || 0;

    let allContent: any[] = [];

    const articles = (responseArticles.data.data.articles || []).map(
      (item: any) => ({
        ...item,
        type: "essay",
        views: item.views || 0,
        isLiked: item.isLiked ?? false,
        likesCount: item.likesCount ?? 0,
      })
    );

    const photographies = (responsePhotography.data.data.photography || []).map(
      (item: any) => ({
        ...item,
        type: "photography",
      })
    );

    const notes = (responseNotes.data.data.notes || []).map((item: any) => ({
      ...item,
      type: "notes",
    }));

    allContent = [
      ...articles.filter(
        (item: any) =>
          !(item.type === contentType.value && item.id == route.query.id)
      ),
      ...photographies.filter(
        (item: any) =>
          !(item.type === contentType.value && item.id == route.query.id)
      ),
      ...notes.filter(
        (item: any) =>
          !(item.type === contentType.value && item.id == route.query.id)
      ),
    ];

    const shuffled = allContent.sort(() => 0.5 - Math.random());
    relatedContent.value = shuffled.slice(0, 3);

    await extractTagsFromContent();
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "获取推荐内容失败";
    ElMessage.error(errorMessage);
  }
};

// 生命周期钩子
onMounted(async () => {
  const id = route.query.id;
  const type = route.query.type;

  if (!id || !type || Array.isArray(type)) {
    console.error("Invalid or unsupported query parameters");
    ElMessage.error("参数错误");
    return;
  }

  contentType.value = type as string;

  try {
    const endpoint = `${ENDPOINTS[type as keyof typeof ENDPOINTS]}/${id}`;
    const contentKey = CONTENT_KEYS[type as keyof typeof CONTENT_KEYS];

    const response = await axiosConfig.get(endpoint);

    if (response?.data?.data) {
      const fetchedContent = response.data.data[contentKey];
      if (fetchedContent) {
        content.value = { ...fetchedContent };
        originalContent.value = JSON.parse(JSON.stringify(fetchedContent));
        ElMessage.success("内容加载成功");

        await fetchRelatedContent();
      } else {
        ElMessage.error("内容不存在");
      }
    } else {
      ElMessage.error("获取内容失败");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "加载内容失败";
    ElMessage.error(errorMessage);
  }
});
</script>

<style scoped lang="less">
@import "../../base-ui/overview.less";
</style>
