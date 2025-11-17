<template>
  <div class="ov-page">
    <div v-if="content" class="ov-shell" :class="`type-${contentType}`">
      <header class="ov-toolbar">
        <div class="ov-breadcrumb">
          <button class="ov-crumb" type="button" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </button>
          <span class="ov-crumb-sep">/</span>
          <span class="ov-crumb active">{{ currentTypeText }}</span>
        </div>
        <div class="ov-actions">
          <el-button
            type="primary"
            :icon="EditOutlined"
            @click="startEditing"
            class="ov-btn"
            >编辑</el-button
          >
          <el-button
            type="danger"
            plain
            :icon="DeleteOutlined"
            @click="handleDelete(content.id)"
            class="ov-btn"
            >删除</el-button
          >
        </div>
      </header>

      <div class="ov-layout" :class="{ full: contentType !== 'essay' }">
        <main class="ov-main">
          <section v-if="contentType === 'essay'" class="ov-card ov-essay">
            <template v-if="isEditing">
              <div class="ov-edit">
                <div class="ov-field">
                  <label class="ov-label">文章标题</label>
                  <el-input
                    v-model="editData.title"
                    placeholder="请输入文章标题"
                    maxlength="100"
                    show-word-limit
                  />
                </div>
                <div class="ov-field">
                  <label class="ov-label">文章标签</label>
                  <el-input
                    v-model="editData.label"
                    placeholder="请输入文章标签"
                    maxlength="20"
                    show-word-limit
                  />
                </div>
                <div class="ov-field">
                  <label class="ov-label">文章内容</label>
                  <el-input
                    v-model="editData.content"
                    type="textarea"
                    :rows="14"
                    placeholder="请输入文章内容"
                    resize="vertical"
                  />
                </div>
                <div class="ov-edit-actions">
                  <el-button
                    type="primary"
                    :icon="CheckOutlined"
                    :loading="isSaving"
                    @click="saveEditing"
                    >保存</el-button
                  >
                  <el-button
                    :icon="CloseOutlined"
                    :disabled="isSaving"
                    @click="cancelEditing"
                    >取消</el-button
                  >
                </div>
              </div>
            </template>
            <template v-else>
              <div v-if="content.image" class="ov-media">
                <el-upload
                  ref="essayUploadRef"
                  class="ov-upload"
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
                  <div class="ov-media-box">
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="ov-media-img"
                      alt="文章封面"
                    />
                    <div class="ov-media-mask">
                      <el-icon><Camera /></el-icon>
                      <span>更换封面</span>
                    </div>
                  </div>
                </el-upload>
                <div v-if="showUploadButton" class="ov-upload-actions">
                  <el-button
                    size="small"
                    type="primary"
                    class="ov-pill"
                    @click="submitUpload('essay')"
                    >更换图片</el-button
                  >
                  <el-button
                    size="small"
                    class="ov-pill"
                    @click="cancelUpload('essay')"
                    >取消</el-button
                  >
                </div>
              </div>

              <header class="ov-head">
                <h1 class="ov-title">{{ content.title }}</h1>
                <div class="ov-meta">
                  <el-tag class="ov-badge" type="primary" effect="light">{{
                    content.label
                  }}</el-tag>
                  <span class="ov-meta-item">
                    <el-icon><Calendar /></el-icon
                    >{{ formatDate(content.createdAt) }}
                  </span>
                  <span class="ov-meta-item">
                    <el-icon><View /></el-icon>{{ content.views || 0 }} 浏览
                  </span>
                  <span class="ov-meta-item">
                    <el-icon><Star /></el-icon
                    >{{ content.likesCount || 0 }} 点赞
                  </span>
                </div>
              </header>

              <article
                class="ov-body"
                v-html="formatContent(content.content)"
              />

              <footer class="ov-foot">
                <div class="ov-cta">
                  <el-button
                    type="primary"
                    :icon="ShareAltOutlined"
                    class="ov-pill"
                    @click="handleShare"
                    >分享</el-button
                  >
                  <el-button
                    :icon="HeartOutlined"
                    :type="isLiked ? 'warning' : ''"
                    class="ov-pill"
                  >
                    {{ isLiked ? "已点赞" : "点赞" }} ({{
                      content.likesCount || 0
                    }})
                  </el-button>
                  <el-dropdown
                    v-if="contentType === 'essay'"
                    @command="changeStyle"
                  >
                    <el-button class="ov-pill" :icon="SkinOutlined"
                      >风格</el-button
                    >
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="default"
                          >默认风格</el-dropdown-item
                        >
                        <el-dropdown-item command="ink"
                          >水墨风格</el-dropdown-item
                        >
                        <el-dropdown-item command="antique"
                          >古典风格</el-dropdown-item
                        >
                        <el-dropdown-item command="modern"
                          >现代风格</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </footer>
            </template>
          </section>

          <section
            v-else-if="contentType === 'photography'"
            class="ov-card ov-photo"
          >
            <template v-if="isEditing">
              <div class="ov-edit">
                <div class="ov-field">
                  <label class="ov-label">作品描述</label>
                  <el-input
                    v-model="editData.content"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入作品描述"
                    resize="vertical"
                  />
                </div>
                <div class="ov-edit-actions">
                  <el-button
                    type="primary"
                    :icon="CheckOutlined"
                    :loading="isSaving"
                    @click="saveEditing"
                    >保存</el-button
                  >
                  <el-button
                    :icon="CloseOutlined"
                    :disabled="isSaving"
                    @click="cancelEditing"
                    >取消</el-button
                  >
                </div>
              </div>
            </template>
            <template v-else>
              <header class="ov-head">
                <h1 class="ov-title">{{ content.title || "摄影作品" }}</h1>
                <div class="ov-meta">
                  <span class="ov-meta-item"
                    ><el-icon><Calendar /></el-icon
                    >{{ formatDate(content.createdAt) }}</span
                  >
                </div>
              </header>

              <div class="ov-photo-hero">
                <el-upload
                  ref="photoUploadRef"
                  class="ov-upload"
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
                  <div class="ov-photo-frame">
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="ov-photo-img"
                      alt="摄影作品"
                    />
                    <div class="ov-photo-mask">
                      <el-button
                        type="primary"
                        :icon="CameraOutlined"
                        class="ov-pill"
                        @click.stop="submitUpload('photography')"
                        >更换图片</el-button
                      >
                      <div v-if="showUploadButton" class="ov-photo-actions">
                        <el-button
                          type="primary"
                          size="small"
                          class="ov-pill"
                          @click="submitUpload('photography')"
                          >确认更换</el-button
                        >
                        <el-button
                          size="small"
                          class="ov-pill"
                          @click="cancelUpload('photography')"
                          >取消</el-button
                        >
                      </div>
                    </div>
                  </div>
                </el-upload>
              </div>

              <div class="ov-sections">
                <section v-if="content.content" class="ov-section">
                  <div class="ov-section-head">
                    <el-icon><Edit /></el-icon>
                    <h3>作品描述</h3>
                  </div>
                  <p class="ov-desc">{{ content.content }}</p>
                </section>
                <section
                  v-if="content.exif && Object.keys(content.exif).length > 0"
                  class="ov-section"
                >
                  <div class="ov-section-head">
                    <el-icon><Camera /></el-icon>
                    <h3>拍摄信息</h3>
                  </div>
                  <div class="ov-exif">
                    <div
                      class="ov-exif-item"
                      v-for="(val, k) in content.exif"
                      :key="k"
                    >
                      <div class="ov-exif-icon">
                        <el-icon v-if="getExifIcon(String(k))"
                          ><component :is="getExifIcon(String(k))"
                        /></el-icon>
                      </div>
                      <div class="ov-exif-meta">
                        <span class="ov-exif-label">{{
                          getExifLabel(String(k))
                        }}</span>
                        <span class="ov-exif-value">{{ String(val) }}</span>
                      </div>
                    </div>
                  </div>
                </section>
                <section
                  v-if="content.tags && content.tags.length"
                  class="ov-section"
                >
                  <div class="ov-section-head">
                    <el-icon><PriceTag /></el-icon>
                    <h3>作品标签</h3>
                  </div>
                  <div class="ov-tags">
                    <el-tag
                      v-for="tag in content.tags"
                      :key="tag"
                      class="ov-tag"
                      type="info"
                      effect="light"
                      >{{ tag }}</el-tag
                    >
                  </div>
                </section>
              </div>
            </template>
          </section>

          <section v-else-if="contentType === 'notes'" class="ov-card ov-notes">
            <template v-if="isEditing">
              <div class="ov-edit">
                <div class="ov-field">
                  <label class="ov-label">随笔标题</label>
                  <el-input
                    v-model="editData.title"
                    placeholder="请输入随笔标题"
                    maxlength="100"
                    show-word-limit
                  />
                </div>
                <div class="ov-field">
                  <label class="ov-label">随笔内容</label>
                  <el-input
                    v-model="editData.content"
                    type="textarea"
                    :rows="12"
                    placeholder="请输入随笔内容"
                    resize="vertical"
                  />
                </div>
                <div class="ov-edit-actions">
                  <el-button
                    type="primary"
                    :icon="CheckOutlined"
                    :loading="isSaving"
                    @click="saveEditing"
                    >保存</el-button
                  >
                  <el-button
                    :icon="CloseOutlined"
                    :disabled="isSaving"
                    @click="cancelEditing"
                    >取消</el-button
                  >
                </div>
              </div>
            </template>
            <template v-else>
              <header class="ov-head">
                <h1 class="ov-title">{{ content.title }}</h1>
                <div class="ov-meta">
                  <span class="ov-meta-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(content.createdAt) }}
                  </span>
                </div>
              </header>

              <div class="ov-note-cover">
                <el-upload
                  ref="notesUploadRef"
                  class="ov-upload"
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
                  <div class="ov-note-frame">
                    <img
                      :src="content.image"
                      v-lazy="content.image"
                      class="ov-note-img"
                      alt="笔记封面"
                    />
                    <div class="ov-note-mask">
                      <!-- 仅保留右下角的更换封面按钮 -->
                      <div class="ov-note-mask-row bottom-right">
                        <el-button
                          type="primary"
                          :icon="CameraOutlined"
                          class="ov-pill"
                          @click.stop="submitUpload('notes')"
                          >更换封面</el-button
                        >
                        <div v-if="showUploadButton" class="ov-upload-actions">
                          <el-button
                            type="primary"
                            size="small"
                            class="ov-pill"
                            @click="submitUpload('notes')"
                            >确认更换</el-button
                          >
                          <el-button
                            size="small"
                            class="ov-pill"
                            @click="cancelUpload('notes')"
                            >取消</el-button
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </el-upload>
              </div>

              <section class="ov-section">
                <div class="ov-section-head">
                  <el-icon><Document /></el-icon>
                  <h3>随笔内容</h3>
                </div>
                <div
                  class="ov-note-body"
                  v-html="formatContent(content.content)"
                />
              </section>
              <section
                v-if="content.tags && content.tags.length"
                class="ov-section"
              >
                <div class="ov-section-head">
                  <el-icon><PriceTag /></el-icon>
                  <h3>标签</h3>
                </div>
                <div class="ov-tags">
                  <el-tag
                    v-for="tag in content.tags"
                    :key="tag"
                    class="ov-tag"
                    type="info"
                    effect="light"
                    >{{
                      tag.length > 6 ? tag.substring(0, 6) + "..." : tag
                    }}</el-tag
                  >
                </div>
              </section>
            </template>
          </section>
        </main>

        <aside v-if="contentType === 'essay'" class="ov-aside">
          <section class="ov-side-card">
            <h3 class="ov-side-title">
              <el-icon><Star /></el-icon>相关推荐
            </h3>
            <div class="ov-rel-list">
              <div
                v-for="item in relatedContent"
                :key="item.id"
                class="ov-rel-item"
                @click="goToDetail(item)"
              >
                <div class="ov-rel-thumb">
                  <img
                    :src="getItemImageUrl(item)"
                    :alt="item.title"
                    @error="handleRelatedImageError"
                  />
                  <span class="ov-rel-type">{{
                    getContentTypeText(item.type)
                  }}</span>
                </div>
                <div class="ov-rel-meta">
                  <h4 class="ov-rel-title">{{ item.title || "无标题" }}</h4>
                  <p class="ov-rel-excerpt">
                    {{ getRelatedExcerpt(item.content) }}
                  </p>
                  <div class="ov-rel-stats">
                    <span class="ov-rel-date">{{
                      formatDate(item.createdAt)
                    }}</span>
                    <div class="ov-rel-right">
                      <span class="ov-rel-stat"
                        ><el-icon><View /></el-icon>{{ item.views || 0 }}</span
                      >
                      <span class="ov-rel-stat"
                        ><el-icon><Star /></el-icon
                        >{{ item.likesCount || 0 }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="ov-side-card">
            <h4 class="ov-side-title">
              <el-icon><PriceTag /></el-icon>热门标签
            </h4>
            <div class="ov-side-tags">
              <el-tag
                v-for="tag in popularTags"
                :key="tag"
                class="ov-side-tag"
                effect="plain"
                >{{ tag }}</el-tag
              >
            </div>
          </section>

          <section class="ov-side-card ov-author-card">
            <div class="ov-author-row">
              <img
                :src="user.avatar || defaultAvatar"
                :alt="user.nickname"
                class="ov-author-avatar"
                @click="openAuthorProfile()"
              />
              <div class="ov-author-info">
                <h4
                  class="ov-author-title"
                  :style="{ color: user.nicknameColor }"
                >
                  {{ user.nickname || "未知昵称" }}
                </h4>
                <p class="ov-author-bio">{{ user.introduce || "未知介绍" }}</p>
              </div>
            </div>

            <!-- 确保统计信息正确显示 -->
            <div
              v-if="articleTotal || photographyTotal || noteTotal"
              class="ov-author-stats"
            >
              <div class="ov-author-stat">
                <span class="num">{{ articleTotal }}</span>
                <span class="lab">博客文章</span>
              </div>
              <div class="ov-author-stat">
                <span class="num">{{ photographyTotal }}</span>
                <span class="lab">摄影图库</span>
              </div>
              <div class="ov-author-stat">
                <span class="num">{{ noteTotal }}</span>
                <span class="lab">随笔随机</span>
              </div>
            </div>

            <!-- 如果没有数据，显示默认信息 -->
            <div v-else class="ov-author-stats">
              <div class="ov-author-stat">
                <span class="num">0</span>
                <span class="lab">博客文章</span>
              </div>
              <div class="ov-author-stat">
                <span class="num">0</span>
                <span class="lab">摄影图库</span>
              </div>
              <div class="ov-author-stat">
                <span class="num">0</span>
                <span class="lab">随笔随机</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>

    <div v-else class="ov-loading">
      <el-icon class="ov-spinner" :size="40"><Loading /></el-icon>
      <p>正在加载内容...</p>
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
  UserOutlined,
  SkinOutlined,
} from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import type { UploadFile } from "element-plus";
import { ElMessage, ElUpload, ElMessageBox } from "element-plus";
import axiosConfig from "../../utils/request";
import { format } from "date-fns";
import { apiUrl } from "../../config";
import { useUserStore } from "../../store/userStore";

const { openAuthorProfile } = useUserStore();
// EXIF 信息标签映射

// EXIF 信息图标映射
const getExifIcon = (key: string) => {
  const iconMap: { [key: string]: any } = {
    相机型号: "Camera",
    镜头: "VideoCamera",
    焦距: "Aim",
    光圈: "CircleCheck",
    快门速度: "Flash",
    ISO: "Sunny",
    曝光补偿: "Adjust",
    白平衡: "Sunny",
    拍摄时间: "Clock",
  };
  return iconMap[key] || "Camera";
};

// EXIF 信息标签映射
const getExifLabel = (key: string) => {
  const labelMap: { [key: string]: string } = {
    Model: "相机型号",
    Lens: "镜头",
    FocalLength: "焦距",
    Aperture: "光圈",
    ShutterSpeed: "快门速度",
    ISO: "ISO",
    ExposureCompensation: "曝光补偿",
    WhiteBalance: "白平衡",
    DateTime: "拍摄时间",
  };
  return labelMap[key] || key;
};

const formatContent = (text: string) => {
  if (!text) return "";

  // 将连续空格或换行转为 <br>，但保留段落结构
  let formattedText = text.replace(/\n/g, "<br>");

  // 如果是纯文本，按行拆分并包裹成 <p>
  if (formattedText.includes("<br>")) {
    const lines = formattedText.split("<br>");
    formattedText = lines
      .map((line) => {
        if (line.trim() === "") return "";
        return `<p>${line.trim()}</p>`;
      })
      .join("");
  }

  // 根据当前风格应用不同的内容格式化
  switch (currentStyle.value) {
    case "ink": // 水墨风格 - 添加书法元素
      formattedText = formatInkStyle(formattedText);
      break;
    case "antique": // 古典风格 - 添加古典元素
      formattedText = formatAntiqueStyle(formattedText);
      break;
    case "modern": // 现代风格 - 添加现代元素
      formattedText = formatModernStyle(formattedText);
      break;
    default: // 默认风格
      formattedText = formatDefaultStyle(formattedText);
  }

  return formattedText;
};

// 默认风格格式化
const formatDefaultStyle = (text: string) => {
  return text;
};

// 水墨风格格式化 - 添加书法元素
const formatInkStyle = (text: string) => {
  // 为段落添加书法类名
  text = text.replace(/<p>/g, '<p class="ink-paragraph">');
  // 检测诗词格式并添加样式
  text = text.replace(
    /<p>([^<]{2}(?:\s+[^<]{2}){2,})<\/p>/g,
    '<p class="ink-poetry">$1</p>'
  );
  return text;
};

// 古典风格格式化 - 添加古典元素
const formatAntiqueStyle = (text: string) => {
  // 为段落添加古典类名
  text = text.replace(/<p>/g, '<p class="antique-paragraph">');
  // 检测古典名言等并添加样式
  text = text.replace(
    /<p>(?:子曰|诗云|古语有云)：?([^<]+)<\/p>/g,
    '<p class="antique-quote">□ $1</p>'
  );
  return text;
};

// 现代风格格式化 - 添加现代元素
const formatModernStyle = (text: string) => {
  // 为段落添加现代类名
  text = text.replace(/<p>/g, '<p class="modern-paragraph">');
  // 检测列表项并添加样式
  text = text.replace(
    /<p>([•·\-]\s*[^<]+)<\/p>/g,
    '<p class="modern-list-item">$1</p>'
  );
  return text;
};
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
  editData.value = {
    title: content.value.title || "",
    label: content.value.label || "",
    content: content.value.content || "",
  };
};
// 添加风格相关的数据和方法
const currentStyle = ref("default");

const changeStyle = (style: string) => {
  currentStyle.value = style;
  document.body.className = `style-${style}`;

  // 保存用户选择到localStorage
  localStorage.setItem("contentStyle", style);

  // ElMessage.success(`已切换到${getStyleName(style)}风格`);
};

const getStyleName = (style: string) => {
  const styleNames: { [key: string]: string } = {
    default: "默认",
    ink: "水墨",
    antique: "古典",
    modern: "现代",
  };
  return styleNames[style] || style;
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

// 导航函数
const goBack = () => {
  router.back();
};
// 在分享按钮点击事件中添加
const handleShare = async () => {
  if (!content.value || !content.value.id) {
    ElMessage.error("无法分享：内容不存在");
    return;
  }

  try {
    // 调用后端分享接口生成分享链接
    const response = await axiosConfig.post(
      `${ENDPOINTS[contentType.value as keyof typeof ENDPOINTS]}/${
        content.value.id
      }/share`
    );

    if (response.data.code === 200) {
      const shareLink = `${window.location.origin}${response.data.data.shareLink}`;

      // 尝试使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareLink);
          ElMessage.success("分享链接已复制到剪贴板");
        } catch (e) {
          console.warn("Clipboard API 失败:", e);
          // 如果失败，使用备用方案
          copyToClipboard(shareLink);
        }
      } else {
        // 使用备用方案
        copyToClipboard(shareLink);
      }
    } else {
      ElMessage.error(response.data.message || "分享失败");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "分享失败";
    ElMessage.error(errorMessage);
  }
};

// 备用复制方法
const copyToClipboard = (text: string) => {
  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);
  input.select();

  try {
    document.execCommand("copy");
    ElMessage.success("分享链接已复制到剪贴板");
  } catch (e) {
    ElMessage.warning("分享链接复制失败，请手动复制");
  }

  document.body.removeChild(input);
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

    const tabMapping: { [key: string]: string } = {
      essay: "essays",
      photography: "photographys",
      note: "notes",
    };

    const tab = tabMapping[contentType.value] || "essays";
    router.push({ name: "share", params: { tab } });
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
  } catch (error) {
    console.error("提取标签失败:", error);
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
    const savedStyle = localStorage.getItem("contentStyle");
    if (savedStyle) {
      currentStyle.value = savedStyle;
      document.body.className = `style-${savedStyle}`;
    }
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
<style scoped lang="scss">
@use "../../assets/scss/overview.scss";
</style>
