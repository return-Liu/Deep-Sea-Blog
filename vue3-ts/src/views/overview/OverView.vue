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

    // 使用 replace 而不是 push，并添加刷新参数
    router.replace({
      path: "/share/essay",
      query: { refresh: Date.now().toString() },
    });
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
.ov-page {
  // padding: 24px 16px;
  position: relative;
  overflow-x: hidden;
  // background: linear-gradient(180deg, #f8f9fe 0%, #eff2f9 100%);
}

.ov-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  // background: linear-gradient(
  //   135deg,
  //   rgba(99, 102, 241, 0.08),
  //   rgba(139, 92, 246, 0.08)
  // );
  clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
  z-index: 0;
}

.ov-shell {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.ov-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}
.ov-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ov-crumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1573e4;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}
.ov-crumb-sep {
  color: #cbd5e1;
}
.ov-crumb.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
  font-weight: 600;
}
.ov-actions {
  display: flex;
  gap: 10px;
}
.ov-btn {
  border-radius: 999px;
}

.ov-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}
.ov-layout.full {
  grid-template-columns: 1fr;
}

.ov-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  position: relative;
}
.ov-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.ov-head {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.ov-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0b1220;
  position: relative;
  padding-bottom: 15px;
}
.ov-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 2px;
}
.ov-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.ov-badge {
  border: none;
  font-weight: 700;
  position: relative;
  overflow: hidden;
}
.ov-badge::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0)
  );
  pointer-events: none;
}
.ov-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
}

.ov-edit {
  padding: 24px;
}
.ov-field {
  margin-bottom: 16px;
}
.ov-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.ov-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.ov-media {
  padding: 16px 24px 0;
}
.ov-upload {
  width: 100%;
}
.ov-media-box {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}
.ov-media-img {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 16/9;
}
.ov-media-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: 0.3s;
  background: linear-gradient(
    to bottom,
    rgba(2, 6, 23, 0.35),
    rgba(2, 6, 23, 0.15)
  );
}
.ov-media-box:hover .ov-media-mask {
  opacity: 1;
  backdrop-filter: blur(4px);
}
.ov-upload-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 12px 0 0;
}
.ov-pill {
  border-radius: 999px;
}

.ov-body {
  padding: 16px 24px 24px;
  max-width: 760px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.9;
  color: #0f172a;
  position: relative;
}
.ov-body::before {
  content: "";
  position: absolute;
  top: 0;
  left: -24px;
  width: 5px;
  height: 100%;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 0 5px 5px 0;
}

/* 默认风格 */
.style-default {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
}

.style-default .ov-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.style-default .ov-card::before {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.style-default .ov-title {
  color: #0b1220;
  font-weight: 800;
}

.style-default .ov-body {
  color: #0f172a;
}

.style-default .ov-body::before {
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 0 5px 5px 0;
}

/* 默认风格文字样式 */
.style-default .ov-body :deep(p) {
  margin: 0 0 1.15em;
  text-align: justify;
}

.style-default .ov-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 2em 0 0.75em;
  color: #0f172a;
  padding-bottom: 0.4em;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.style-default .ov-body :deep(h2)::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 1px;
}

.style-default .ov-body :deep(blockquote) {
  margin: 2em 0;
  padding: 1.5em 2em;
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #4b5563;
}

/* 水墨风格 */
.style-ink {
  background: #f5f1e0;
  font-family: "STKaiti", "KaiTi", serif;
}

.style-ink .ov-card {
  background: #fdf6e3;
  border: 1px solid #d5c4a1;
  box-shadow: 0 4px 12px rgba(146, 128, 80, 0.2);
  border-radius: 8px;
}

.style-ink .ov-card::before {
  background: linear-gradient(90deg, #458588, #689d6a);
  height: 6px;
}

.style-ink .ov-title {
  color: #3c3836;
  font-family: "STKaiti", "KaiTi", serif;
  text-align: center;
  position: relative;
  padding-bottom: 20px;
}

.style-ink .ov-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, #458588, #689d6a);
}

.style-ink .ov-body {
  color: #3c3836;
  font-family: "STKaiti", "KaiTi", serif;
  background-image: linear-gradient(
      rgba(146, 128, 80, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(146, 128, 80, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 20px;
  border-radius: 4px;
}

.style-ink .ov-body::before {
  background: linear-gradient(180deg, #458588, #689d6a);
  border-radius: 0 3px 3px 0;
}

.style-ink .ov-meta-item {
  background: #f0e6d2;
  border: 1px solid #d5c4a1;
}

/* 水墨风格文字样式 */
.style-ink .ov-body :deep(.ink-paragraph) {
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 1.1em;
  line-height: 1.8;
  text-indent: 2em;
  margin: 0.8em 0;
}

.style-ink .ov-body :deep(.ink-poetry) {
  font-family: "STKaiti", "KaiTi", serif;
  text-align: center;
  text-indent: 0;
  font-size: 1.2em;
  line-height: 2;
  margin: 2em 0;
  padding: 1.5em;
  border-left: none;
  border-top: 1px solid #d5c4a1;
  border-bottom: 1px solid #d5c4a1;
  background: rgba(240, 230, 210, 0.3);
  border-radius: 0;
}

.style-ink .ov-body :deep(h2) {
  font-family: "STKaiti", "KaiTi", serif;
  text-align: center;
  font-size: 1.8rem;
  margin: 2em 0 1em;
  color: #3c3836;
  border-bottom: 1px solid #d5c4a1;
}

.style-ink .ov-body :deep(h2)::after {
  display: none;
}

.style-ink .ov-body :deep(blockquote) {
  font-family: "STKaiti", "KaiTi", serif;
  border-left: 3px solid #458588;
  background: rgba(146, 128, 80, 0.05);
  color: #3c3836;
}

/* 古典风格 */
.style-antique {
  background: #f0ebe6
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f9f5f0'/%3E%3Cpath d='M20 20h60v60H20z' fill='none' stroke='%23d8cfc4' stroke-width='0.5'/%3E%3C/svg%3E");
}

.style-antique .ov-card {
  background: #f9f5f0;
  border: 1px solid #d8cfc4;
  box-shadow: 0 4px 12px rgba(180, 150, 120, 0.25);
  border-radius: 12px;
}

.style-antique .ov-card::before {
  background: linear-gradient(90deg, #a86b4c, #c19a6b);
  height: 6px;
}

.style-antique .ov-title {
  color: #503930;
  font-family: "STKaiti", "KaiTi", serif;
  position: relative;
  padding-left: 20px;
}

.style-antique .ov-body {
  color: #503930;
  font-family: "STSong", "SimSun", serif;
  line-height: 1.8;
}

.style-antique .ov-body::before {
  background: linear-gradient(180deg, #a86b4c, #c19a6b);
  border-radius: 0 3px 3px 0;
}

.style-antique .ov-meta-item {
  background: #f0e6d2;
  border: 1px solid #d8cfc4;
  border-radius: 12px;
}

/* 古典风格文字样式 */
.style-antique .ov-body :deep(.antique-paragraph) {
  font-family: "STSong", "SimSun", serif;
  font-size: 1.05em;
  line-height: 1.9;
  text-indent: 2em;
  margin: 0.8em 0;
}

.style-antique .ov-body :deep(.antique-quote) {
  font-family: "STSong", "SimSun", serif;
  font-style: italic;
  padding: 1em 1.5em;
  background: rgba(240, 230, 210, 0.4);
  border-top: 1px solid #d8cfc4;
  border-bottom: 1px solid #d8cfc4;
  margin: 1.5em 0;
}

.style-antique .ov-body :deep(h2) {
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 1.6rem;
  margin: 2em 0 1em;
  color: #503930;
  border-bottom: 1px solid #d8cfc4;
}

.style-antique .ov-body :deep(h2)::after {
  display: none;
}

.style-antique .ov-body :deep(blockquote) {
  border-left: 3px solid #a86b4c;
  background: rgba(180, 150, 120, 0.1);
  color: #503930;
}

/* 现代风格 */
.style-modern {
  background: #f8f9fa;
}

.style-modern .ov-card {
  background: #ffffff;
  border: 1px solid #e4e7ec;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-radius: 24px;
}

.style-modern .ov-card::before {
  background: linear-gradient(90deg, #38b2ac, #4fd1c5);
  height: 4px;
}

.style-modern .ov-title {
  color: #2d3748;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.style-modern .ov-body {
  color: #4a5568;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.7;
}

.style-modern .ov-body::before {
  background: linear-gradient(180deg, #38b2ac, #4fd1c5);
  border-radius: 0 2px 2px 0;
}

.style-modern .ov-meta-item {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

/* 现代风格文字样式 */
.style-modern .ov-body :deep(.modern-paragraph) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 1em;
  line-height: 1.7;
  margin: 1em 0;
  text-align: justify;
}

.style-modern .ov-body :deep(.modern-list-item) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  margin: 0.5em 0 0.5em 1.5em;
}

.style-modern .ov-body :deep(h2) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 1.7rem;
  font-weight: 600;
  margin: 2em 0 1em;
  color: #2d3748;
  border-bottom: none;
  padding-left: 0.8em;
  position: relative;
}

.style-modern .ov-body :deep(h2)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.4em;
  width: 4px;
  height: 1.2em;
  background: linear-gradient(180deg, #38b2ac, #4fd1c5);
  border-radius: 2px;
}

.style-modern .ov-body :deep(h2)::after {
  display: none;
}

.style-modern .ov-body :deep(blockquote) {
  border-left: 4px solid #38b2ac;
  background: rgba(56, 178, 172, 0.05);
  color: #4a5568;
  border-radius: 4px;
}

.ov-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 24px;
  border-top: 1px solid #f1f5f9;
  gap: 12px;
  flex-wrap: wrap;
}

.ov-cta {
  display: flex;
  gap: 10px;
}

/* 摄影 */
.ov-photo-hero {
  padding: 0;
}
.ov-photo-frame {
  position: relative;
  overflow: hidden;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.4);
  // border: 10px solid #fff;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 20px;
}
.ov-photo-frame:hover {
  transform: translateY(-8px);
  box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.5);
}
.ov-photo-frame::before {
  content: "";
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  // border: 1px solid rgba(255, 255, 255, 0.15);
  pointer-events: none;
  z-index: 1;
}
.ov-photo-img {
  width: 100%;
  height: 80vh;
  min-height: 500px;
  object-fit: cover;
  background: radial-gradient(1200px 600px at 50% 10%, #111827 0%, #000 60%);
  transition: transform 0.5s ease;
}
.ov-photo-frame:hover .ov-photo-img {
  transform: scale(1.03);
}
.ov-photo-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 30px;
  opacity: 0;
  transition: all 0.4s ease;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
}
.ov-photo-frame:hover .ov-photo-mask {
  opacity: 1;
}
.ov-photo-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.ov-sections {
  padding: 32px;
}
.ov-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.ov-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}
.ov-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 16px 16px 0 0;
}
.ov-section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(15, 23, 42, 0.15);
}
.ov-section-head h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}
.ov-desc {
  margin: 0 0 24px;
  color: #475569;
  line-height: 1.8;
  white-space: pre-line;
  font-size: 1.05rem;
}
.ov-exif {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.ov-exif-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.ov-exif-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
}
.ov-exif-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.05),
    rgba(139, 92, 246, 0.05)
  );
  pointer-events: none;
}
.ov-exif-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.ov-exif-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ov-exif-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ov-exif-value {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
}

/* 随笔 */
.ov-note-cover {
  padding: 0 24px;
}
/* 添加页边距和装订线效果 */
.ov-note-frame {
  position: relative;
  height: 520px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #e6f0ff 0%, #d1e0ff 100%);
  box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;

  /* 左侧装订线 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(0deg, #6366f1, #8b5cf6);
    border-radius: 2px;
    opacity: 0.6;
  }
}

.ov-note-frame:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px -15px rgba(99, 102, 241, 0.3);
}

.ov-note-frame::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
      circle at 10% 20%,
      rgba(99, 102, 241, 0.15) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(99, 102, 241, 0.15) 1px,
      transparent 1px
    );
  background-size: 30px 30px;
  pointer-events: none;
  opacity: 0.7;
}

.ov-note-frame::after {
  content: "";
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  // border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  pointer-events: none;
}

.ov-note-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.95) contrast(1.1) saturate(1.1);
  transition: all 0.4s ease;
}

.ov-note-frame:hover .ov-note-img {
  filter: brightness(1) contrast(1.1) saturate(1.2);
}

.ov-note-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  padding: 30px;
  display: grid;
  grid-template-areas: "br";
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  opacity: 0;
  transition: all 0.4s ease;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.4) 0%,
    transparent 30%,
    transparent 70%,
    rgba(139, 92, 246, 0.5) 100%
  );
  backdrop-filter: blur(2px);
}

.ov-note-frame:hover .ov-note-mask {
  opacity: 1;
}

.ov-note-mask-row.bottom-right {
  grid-area: br;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
  pointer-events: all;
}

.ov-note-frame:hover .ov-note-mask {
  opacity: 1;
}

.ov-type {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.9) 0%,
    rgba(139, 92, 246, 0.9) 100%
  );
  color: #fff;
  padding: 12px 20px;
  border-radius: 30px;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ov-note-title {
  margin: 0;
  color: #1e293b;
  font-size: 2.5rem;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  position: relative;
  padding: 20px 40px;
  text-align: center;
  font-family: "STKaiti", "KaiTi", serif;
  letter-spacing: 2px;
}

.ov-note-title::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 5px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
}

.ov-note-body {
  font-size: 17px;
  line-height: 1.9;
  color: #2d3748;
  padding: 28px 32px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  margin-top: 28px;
  box-shadow: inset 0 0 15px rgba(99, 102, 241, 0.1),
    0 5px 20px rgba(99, 102, 241, 0.15);

  /* 横线稿纸背景 + 微弱纹理 */
  background-image: linear-gradient(
      rgba(99, 102, 241, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
  background-size: 24px 24px;
  border: 1px solid rgba(99, 102, 241, 0.15);

  /* 添加行间距和段落样式 */
  p {
    margin: 0 0 1.4em;
    text-align: justify;
    font-family: "STSong", "SimSun", serif;
    word-spacing: 1px;
  }

  /* 每行单独处理（模拟手写） */
  :deep(p) {
    display: block;
    white-space: pre-line; /* 保留换行符 */
    overflow-wrap: break-word;
    hyphens: auto;
  }

  /* 增加轻微阴影，模拟纸张质感 */
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.9),
      rgba(255, 255, 255, 0.8)
    );
    pointer-events: none;
    z-index: -1;
  }
}

.ov-note-body :deep(p) {
  margin: 0 0 1.4em;
  text-align: justify;
  font-family: "STSong", "SimSun", serif;
}

.ov-note-body :deep(h2) {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 2em 0 1em;
  color: #1a202c;
  position: relative;
  padding-left: 20px;
  font-family: "STKaiti", "KaiTi", serif;
}

.ov-note-body :deep(h2)::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 5px;
  height: 24px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  border-radius: 2px;
}

.ov-note-body :deep(.poetry) {
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 1.2em;
  line-height: 2;
  text-align: center;
  margin: 2em 0;
  padding: 1.5em;
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 0 8px 8px 0;
}

.ov-note-body :deep(.seal) {
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid #e53e3e;
  border-radius: 6px;
  color: #e53e3e;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  transform: rotate(-5deg);
  margin: 0 8px;
  font-size: 1.1em;
}

/* 侧栏 */
.ov-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 96px;
  height: fit-content;
}
.ov-side-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.07);
  padding: 16px;
}
.ov-side-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.ov-rel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ov-rel-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  transition: 0.2s;
}
.ov-rel-item:hover {
  transform: translateY(-2px);
  background: #f8fafc;
}
.ov-rel-thumb {
  position: relative;
  width: 88px;
  height: 66px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.ov-rel-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ov-rel-type {
  position: absolute;
  right: 4px;
  top: 4px;
  font-size: 10px;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
}
.ov-rel-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ov-rel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ov-rel-excerpt {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ov-rel-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ov-rel-date {
  font-size: 11px;
  color: #94a3b8;
}
.ov-rel-right {
  display: flex;
  gap: 8px;
}
.ov-rel-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}
.ov-side-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.ov-side-tag {
  border-color: rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}
.ov-author-card .ov-author-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.ov-author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}
.ov-author-info {
  flex: 1;
}
.ov-author-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.ov-author-bio {
  margin: 0;
  font-size: 12px;
  color: #475569;
}
.ov-author-stats {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  padding-top: 12px;
}
.ov-author-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.ov-author-stat .num {
  font-size: 18px;
  font-weight: 700;
}
.ov-author-stat .lab {
  font-size: 12px;
  color: #64748b;
}

/* 加载 */
.ov-loading {
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  gap: 16px;
}
.ov-spinner {
  color: #6366f1;
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .ov-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .ov-title {
    font-size: 1.75rem;
  }
  .ov-photo-img {
    height: 70vh;
    min-height: 400px;
  }
  .ov-note-frame {
    height: 380px;
  }
}
@media (max-width: 480px) {
  .ov-title {
    font-size: 1.5rem;
  }
  .ov-photo-img {
    height: 60vh;
    min-height: 300px;
  }
  .ov-note-frame {
    height: 320px;
  }
}

/* 滚动条 */
::deep(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}
::deep(::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}
::deep(::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}
::deep(::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* 添加传统文化元素样式 */
.poetry-line {
  text-align: center;
  font-style: italic;
  margin: 10px 0;
  padding: 10px;
  border-left: 3px solid #6366f1;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 0 8px 8px 0;
}

/* 添加书法字体支持 */
.calligraphy {
  font-family: "STKaiti", "KaiTi", serif;
  font-size: 1.2em;
  line-height: 2;
}

/* 添加古典边框 */
.classical-border {
  border: 1px solid #d1d5db;
  border-image: linear-gradient(45deg, #6366f1, #8b5cf6) 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 添加水墨画风格 */
.ink-wash {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  position: relative;
  overflow: hidden;
}

.ink-wash::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.1) 0%,
    transparent 70%
  );
  transform: rotate(30deg);
  pointer-events: none;
}

/* 添加古典纹理 */
.antique-paper {
  background-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.03) 50%,
      transparent 50%
    ),
    linear-gradient(rgba(0, 0, 0, 0.03) 50%, transparent 50%);
  background-size: 20px 20px;
}

/* 添加印章样式 */
.seal {
  display: inline-block;
  padding: 2px 8px;
  border: 2px solid #dc2626;
  border-radius: 4px;
  color: #dc2626;
  font-weight: bold;
  font-family: "STKaiti", "KaiTi", serif;
  transform: rotate(-5deg);
  margin: 0 5px;
}
</style>
