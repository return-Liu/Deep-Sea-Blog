<template>
  <div class="content-container" v-if="content">
    <div class="content-card" :class="contentType">
      <!-- 文章类型 -->
      <div v-if="contentType === 'essay'" class="essay-content">
        <div class="meta-header">
          <span class="category-tag">{{ content.label }}</span>
          <span class="date">{{ formatDate(content.createdAt) }}</span>
        </div>
        <h1 class="title">{{ content.title }}</h1>
        <div class="featured-image" v-if="content.image">
          <img v-lazy="content.image" alt="博客文章" />
        </div>
        <div class="content-text" v-html="formatContent(content.content)"></div>
        <div class="footer-meta">
          <div class="author-info">
            <img
              @click="openAuthorProfile()"
              :src="user.avatar"
              alt="作者头像"
              class="avatar"
            />
            <span :style="{ color: user.nicknameColor }"
              >作者: {{ user.nickname || "匿名" }}</span
            >
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
          <img v-lazy="content.image" alt="摄影作品" class="photo-image" />
          <div class="photo-overlay">
            <span class="date">{{ formatDate(content.createdAt) }}</span>
            <h2 class="photo-title">{{ content.title || "摄影作品" }}</h2>
            <p class="photo-desc">{{ content.content }}</p>
          </div>
        </div>
        <div class="exif-data" v-if="content.exif">
          <div
            class="exif-item"
            v-for="(value, key) in content.exif"
            :key="key"
          >
            <span class="exif-label">{{ key }}:</span>
            <span class="exif-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 笔记类型 -->
      <div v-else-if="contentType === 'notes'" class="notes-content">
        <div class="note-header">
          <h2 class="note-title">{{ content.title }}</h2>
          <span class="note-date">{{ formatDate(content.createdAt) }}</span>
        </div>
        <div class="note-image" v-if="content.image">
          <img v-lazy="content.image" alt="随笔图片" />
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
import { useRoute } from "vue-router";
import axiosConfig from "../../utils/request";
import { format } from "date-fns";
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();
const contentType = ref<string>("");
const content = ref<any>(null);
import { useRouter } from "vue-router";
const router = useRouter();
// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "yyyy年MM月dd日");
  } catch {
    return dateString;
  }
};
const openAuthorProfile = () => {
  router.push({
    name: "users",
    params: { uuid: userStore.user?.uuid },
  });
};
// 格式化内容（如果有HTML内容）
const formatContent = (text: string) => {
  // 这里可以添加更多的内容处理逻辑
  return text || "";
};

onMounted(async () => {
  const id = route.query.id;
  const type = route.query.type;

  if (!id || !type || Array.isArray(type)) {
    console.error("Invalid or unsupported query parameters");
    return;
  }

  contentType.value = type;

  try {
    let response;
    if (type === "essay") {
      response = await axiosConfig.get(`/admin/article/${id}`);
    } else if (type === "photography") {
      response = await axiosConfig.get(`/admin/photography/${id}`);
    } else if (type === "notes") {
      response = await axiosConfig.get(`/admin/note/${id}`);
    }

    if (response && response.data.data) {
      if (type === "essay") {
        content.value = response.data.data.article;
      } else if (type === "photography") {
        content.value = response.data.data.photography;
      } else if (type === "notes") {
        content.value = response.data.data.note;
      }
    }
  } catch (error) {
    console.error("Failed to fetch content:", error);
  }
});
</script>

<style scoped>
/* 基础布局 */
.content-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.content-card {
  background: var(--bg1);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
/* 通用样式 */
.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-bg6);
  margin: 1.5rem 0;
  line-height: 1.3;
  color: var(--color-bg4);
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-tag {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: var(--color-bg4);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.date {
  color: var(--color-bg4);
  font-size: 0.9rem;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 文章样式 */
.essay-content {
  padding: 2.5rem;
}

.featured-image {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.featured-image img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-bg4);
  margin-bottom: 2rem;
}

.content-text >>> p {
  margin-bottom: 1.5rem;
}

.content-text >>> h2 {
  font-size: 1.6rem;
  margin: 2rem 0 1rem;
  color: var(--color-bg4);
}

.content-text >>> blockquote {
  border-left: 4px solid #a777e3;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: var(--color-bg4);
  font-style: italic;
}
.footer-meta {
  display: flex;
  justify-content: space-between; /* 左右分布 */
  align-items: center; /* 垂直居中 */
  border-top: 1px solid #ecf0f1;
  padding-top: 1.5rem;
  margin-top: 2rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-bg4);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 20px; /* 调整按钮间距 */
  color: var(--color-bg4);
  font-size: 14px;
}

.like-btn,
.views-btn {
  display: flex;
  align-items: center; /* 图标和文字垂直居中 */
  gap: 5px; /* 图标和文字的间距 */
  padding: 8px 16px; /* 按钮内边距 */
  border: none;
  background-color: transparent;
  cursor: pointer;
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column; /* 堆叠显示 */
    gap: 10px; /* 调整堆叠间距 */
  }
}
/* 摄影样式 */
.photography-content {
  position: relative;
}

.photo-container {
  position: relative;
}

.photo-image {
  width: 100%;
  max-height: 80vh;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 2rem;
  color: var(--color-bg4);
}

.photo-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.photo-desc {
  font-size: 1rem;
  opacity: 0.9;
}

.exif-data {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 2rem;
  background: var(--bg1);
}

.exif-item {
  display: flex;
  flex-direction: column;
}

.exif-label {
  font-weight: 600;
  color: var(--color-bg4);
  font-size: 0.9rem;
}

.exif-value {
  color: var(--color-bg4);
  font-size: 1rem;
}

/* 笔记样式 */
.notes-content {
  padding: 2rem;
}

.note-header {
  margin-bottom: 2rem;
}

.note-title {
  font-size: 1.8rem;
  color: var(--color-bg4);
  margin-bottom: 0.5rem;
}

.note-date {
  color: var(--color-bg4);
  font-size: 0.9rem;
}

.note-image {
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
}

.note-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.note-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-bg4);
  margin-bottom: 2rem;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.tag {
  background: var(--bg1);
  color: var(--color-bg4);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border);
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .essay-content,
  .notes-content {
    padding: 1.5rem;
  }

  .title,
  .note-title {
    font-size: 1.6rem;
  }

  .photo-overlay {
    padding: 1rem;
  }

  .photo-title {
    font-size: 1.4rem;
  }

  .exif-data {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
</style>
