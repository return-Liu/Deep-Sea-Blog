<!-- 照片墙 -->
<template>
  <div class="walls-container">
    <!-- 优化和更新 -->
    <el-alert
      title="照片墙功能正在开发中，敬请期待..."
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>
    <nav class="walls-nav">
      <ul class="nav-list">
        <li v-for="tab in tabs" :key="tab.id" class="nav-item">
          {{ tab.title }}
          <div class="active-indicator"></div>
        </li>
      </ul>
      <p class="nav-desc">让每一帧画面——都成为时光的印记</p>
    </nav>
    <section class="category-filter">
      <keep-alive>
        <div class="filter-group" v-show="activeTab === 'photos'">
          <button
            v-for="photo in photoCategories"
            :key="photo.id"
            class="filter-btn"
            :class="{ active: activeCategory === photo.id }"
            @click="handlePhotoClick(photo)"
          >
            {{ photo.name }}
          </button>
        </div>
      </keep-alive>
    </section>
    <section class="walls-sidebar">
      <el-input
        v-model="search"
        placeholder="搜索照片 发现美好瞬间..."
        clearable
        class="search"
        @clear="handleSearch"
      />
    </section>
    <main class="walls-main">
      <transition-group
        v-if="activeTab === 'photos'"
        name="staggered-fade"
        tag="div"
        class="photos-grid"
      >
      </transition-group>
    </main>
    <div class="floating-actions">
      <el-tooltip
        effect="dark"
        :content="activeTab === 'photos' ? '传照片' : '写留言'"
        placement="left"
      >
        <button
          class="fab-button"
          @click="
            activeTab === 'photos' ? showAddMessage() : (showPhotoDrawer = true)
          "
        >
          <el-icon :size="24">
            <component :is="activeTab === 'messages' ? Edit : Plus" />
          </el-icon>
        </button>
      </el-tooltip>
    </div>
    <el-drawer
      v-model="showMessageDrawer"
      direction="rtl"
      size="40%"
      :before-close="handleCloseDrawer"
      :close-on-click-modal="false"
    >
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import usePhotoWall from "../../hooks/usePhotoWall";
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
  Plus,
  Edit,
  SuccessFilled,
  handleCloseDrawer,
  showMessageDrawer,
} = usePhotoWall();
</script>
<style lang="less" scoped>
@import "../../base-ui/photowall.less";
</style>
