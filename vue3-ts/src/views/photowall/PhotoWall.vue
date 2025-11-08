<template>
  <div class="photos-container">
    <!-- 顶部提示 -->
    <el-alert
      title="照片墙功能正在开发中，敬请期待..."
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    ></el-alert>

    <!-- 导航区域 -->
    <nav class="photos-nav">
      <ul class="nav-list">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.title }}
          <div class="active-indicator"></div>
        </li>
      </ul>
      <p class="nav-desc">让每一帧画面——都成为时光的印记</p>
    </nav>

    <!-- 分类筛选 -->
    <section class="category-filter">
      <div class="filter-group" v-show="activeTab === 'photos'">
        <button
          v-for="category in photoCategories"
          :key="category.id"
          class="filter-btn"
          :class="{ active: activeCategory === category.id }"
          @click="handlePhotoClick(category)"
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <!-- 搜索区域 -->
    <section class="search-section">
      <el-input
        v-model="search"
        placeholder="搜索照片 发现美好瞬间..."
        clearable
        class="search-input"
        @clear="handleSearch"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </section>

    <div v-if="errorMessage" class="error-state">
      <p>{{ errorMessage }}</p>
      <el-button @click="refreshPhotos">重试</el-button>
    </div>

    <!-- 照片网格 -->
    <main class="photos-main">
      <transition-group
        v-if="activeTab === 'photos' && filteredPhotos.length"
        name="staggered-fade"
        tag="div"
        class="photos-grid"
      >
        <article
          v-for="photo in filteredPhotos"
          :key="photo.id"
          class="photo-card"
          :style="{ '--delay': photo.delay }"
          @click="handlePhotoView(photo)"
        >
          <div class="photo-image">
            <transition name="image-fade" mode="out-in">
              <img
                v-if="photo.photoImages"
                :src="photo.photoImages"
                :alt="photo.title"
                loading="lazy"
                @load="handleImageLoad(photo)"
                @error="handleImageError($event, photo)"
                :class="{ loaded: photo.loaded }"
              />
              <div v-else class="photo-placeholder">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </transition>
          </div>
        </article>
      </transition-group>
    </main>

    <!-- 浮动操作按钮 -->
    <div class="floating-actions">
      <el-tooltip effect="dark" content="上传照片" placement="left">
        <button class="fab-button" @click="showAddMessage">
          <el-icon :size="24">
            <Plus />
          </el-icon>
        </button>
      </el-tooltip>
    </div>

    <!-- 照片上传/编辑抽屉 -->
    <el-drawer
      v-model="showMessageDrawer"
      direction="rtl"
      :title="drawerTitle"
      size="40%"
      :before-close="handleCloseDrawer"
      :close-on-click-modal="false"
    >
      <div class="photo-form-container">
        <form class="photo-form" @submit.prevent="handleSubmit">
          <!-- 照片标题 -->
          <div class="form-group" v-if="isEditable">
            <label class="form-label">照片标题</label>
            <el-input
              v-model="PhotoForm.title"
              placeholder="请输入照片标题..."
              clearable
              maxlength="50"
              show-word-limit
            />
          </div>

          <!-- 照片上传 -->
          <div class="form-group">
            <label class="form-label">上传照片</label>
            <el-upload
              class="photo-uploader"
              :action="`${apiUrl}/admin/upload`"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleSuccess"
              method="post"
              :data="{ userId: userId }"
              name="image"
              :auto-upload="false"
              ref="uploadRef"
              @change="handleChange"
            >
              <div class="upload-container">
                <img
                  v-if="PhotoForm.photoImages"
                  :src="PhotoForm.photoImages"
                  class="uploaded-image"
                  @error="handleImageError"
                />
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">
                    支持图片 (JPG/PNG/GIF/WEBP/BMP) 格式，大小不超过 5MB
                  </span>
                </div>
              </div>
            </el-upload>
          </div>

          <!-- 照片分类 -->
          <div class="form-group" v-if="isEditable">
            <label class="form-label">照片分类</label>
            <div class="tag-group">
              <span
                v-for="category in photoCategories"
                :key="category.id"
                class="tag"
                @click="handleTagClick(category)"
                :class="{
                  'tag-active': PhotoForm.category === category.id,
                }"
              >
                {{ category.name }}
              </span>
            </div>
          </div>

          <!-- 照片描述 -->
          <div class="form-group" v-if="isEditable">
            <label class="form-label">照片描述</label>
            <el-input
              v-model="PhotoForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入照片的描述内容..."
              maxlength="200"
              show-word-limit
            />
          </div>

          <!-- 表单操作 -->
          <div class="form-actions">
            <el-button
              v-if="isEditable && PhotoForm.id && userId === PhotoForm.userId"
              type="danger"
              class="delete-btn"
              @click="DeletePhoto()"
              :loading="deleteLoadingRef"
            >
              <el-icon><Delete /></el-icon>
              <span>删除照片</span>
            </el-button>

            <div class="action-buttons">
              <el-button
                v-if="showUploadButton"
                type="primary"
                class="upload-btn"
                @click="submitUpload"
                :loading="uploadLoadingRef"
              >
                <el-icon><Upload /></el-icon>
                <span>上传图片</span>
              </el-button>

              <el-button
                type="primary"
                class="submit-btn"
                @click="handleSubmit"
                :loading="submitLoadingRef"
              >
                <el-icon><SuccessFilled /></el-icon>
                <span>{{ isEdit ? "保存修改" : "保存照片" }}</span>
              </el-button>
            </div>
          </div>
        </form>
      </div>
    </el-drawer>

    <!-- 自定义模态框 -->
    <div v-if="showCustomModal" class="custom-modal-overlay">
      <div class="custom-modal">
        <div class="modal-header">
          <h3>{{ viewingPhoto?.title || "未命名照片" }}</h3>
          <button @click="closeCustomModal">关闭</button>
        </div>
        <div class="modal-body">
          <img
            :src="viewingPhoto?.photoImages"
            :alt="viewingPhoto?.title"
            class="viewer-image"
          />
          <p>{{ viewingPhoto?.description || "暂无描述" }}</p>
          <div class="viewer-meta">
            <span class="category">{{
              getCategoryName(viewingPhoto?.category)
            }}</span>
            <span class="date">{{ formatDate(viewingPhoto?.date) }}</span>
          </div>
          <div v-if="userId === viewingPhoto?.userId" class="viewer-actions">
            <button @click="handleEditPhoto(viewingPhoto)">编辑</button>
            <button @click="DeletePhoto()">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import usePhotoWall from "../../hooks/usePhotoWall";
import { YkEmpty } from "@yike-design/ui";
import { ref, onMounted } from "vue";
import {
  Search,
  Picture,
  Star,
  Share,
  Clock,
  Delete,
  Upload,
  Loading,
} from "@element-plus/icons-vue";

const uploadLoadingRef = ref(false);
const submitLoadingRef = ref(false);
const deleteLoadingRef = ref(false);

const {
  tabs,
  activeTab,
  photoCategories,
  activeCategory,
  search,
  handlePhotoClick,
  showPhotoDrawer,
  handleSearch,
  showAddMessage,
  handleEditPhoto,
  showCustomModal,
  closeCustomModal,
  Plus,
  Edit,
  handleCloseDrawer,
  showMessageDrawer,
  filteredPhotos,
  PhotoForm,
  isEdit,
  userId,
  apiUrl,
  isEditable,
  beforeUpload,
  handleChange,
  handleSuccess,
  handleTagClick,
  DeleteOutlined,
  handleDeletePhoto,
  uploadRef,
  showUploadButton,
  photoImages,
  submitUpload,
  handleSubmit,
  formatDate,
  getCategoryName,
  handleImageError,
  drawerTitle,
  viewingPhoto,
  handlePhotoView,
  errorMessage,
  refreshPhotos,
  handleImageLoad,
  DeletePhoto,
} = usePhotoWall();

// 懒加载图片
const lazyLoadImages = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || "";
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  });

  const images = document.querySelectorAll(".lazy-image");
  images.forEach((img) => observer.observe(img));
};

onMounted(() => {
  lazyLoadImages();
});
</script>

<style lang="less" scoped>
@import "../../base-ui/photowall.less";
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.custom-modal {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  padding: 32px;
  max-width: 80%;
  max-height: 90vh;
  overflow-y: auto;
  transition: all 0.3s ease-in-out;
  transform: scale(0.95);
  animation: modalFadeIn 0.4s ease-out forwards;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 24px;
      color: #333;
    }

    button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      transition: color 0.2s;

      &:hover {
        color: #d32f2f;
      }
    }
  }

  .modal-body {
    .viewer-image {
      max-width: 100%;
      height: auto;
      margin-bottom: 10px;
      cursor: zoom-in;
      transition: transform 0.3s ease;

      &.zoomed {
        transform: scale(1.2);
        cursor: zoom-out;
      }
    }

    p {
      font-size: 16px;
      color: #555;
      margin-bottom: 10px;
    }

    .viewer-meta {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #888;
      margin-bottom: 20px;
    }

    .viewer-actions {
      display: flex;
      gap: 10px;

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;

        &:first-child {
          background-color: #2196f3;
          color: white;

          &:hover {
            background-color: #1976d2;
          }
        }

        &:last-child {
          background-color: #d32f2f;
          color: white;

          &:hover {
            background-color: #c62828;
          }
        }
      }
    }
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.custom-modal.fade-out {
  animation: modalFadeOut 0.3s ease-in forwards;
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
