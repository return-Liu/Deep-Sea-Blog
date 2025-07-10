<template>
  <div class="user-details-container">
    <!-- 顶部用户信息区域 -->
    <div class="top-section">
      <div class="user-profile">
        <div class="left-info">
          <div v-if="user" class="user-info">
            <div class="avatar-container">
              <img
                :src="user.avatar"
                alt="Avatar"
                class="avatar"
                @click="handleAvatarClick"
              />
            </div>
            <div class="user-text">
              <div class="nickname-uuid">
                <h2
                  class="nickname"
                  :style="{ color: user?.nicknameColor || '#000' }"
                >
                  {{ user.nickname }}
                </h2>
                <p class="uuid">
                  <component class="user-icon-left" :is="UuidIcon" />
                  <span class="uuid-text">{{ user.uuid }}</span>
                </p>
              </div>
              <p class="introduce">
                <component class="user-icon-left" :is="IntroduceIcon" />
                <span class="introduce-text">
                  {{ user.introduce || "这个人很懒，什么都没写~" }}
                </span>
              </p>
            </div>
          </div>
          <div v-else class="loading">
            <p>加载中...</p>
          </div>
        </div>

        <div class="right-info">
          <div class="info-list">
            <div class="info-item">
              <component class="user-icon-right" :is="AreaIcon" />
              <span>IP属地:{{ user?.area || "未知" }}</span>
            </div>
            <div class="info-item">
              <component class="user-icon-right" :is="BirthdayIcon" />
              <span>生日:{{ formatDate(user?.birthday || "未知") }}</span>
            </div>
            <div class="info-item">
              <component class="user-icon-right" :is="ConstellationIcon" />
              <span>星座:{{ user?.constellation || "未知" }}</span>
            </div>
          </div>
          <div class="stats-list">
            <div class="stat-item">
              <component class="user-icon-right" :is="BlogIcon" />
              <div class="stat-value">{{ articles.length }}</div>
              <div class="stat-label">文章</div>
            </div>
            <div class="stat-item">
              <component class="user-icon-right" :is="PhotographyIcon" />
              <div class="stat-value">{{ photos.length }}</div>
              <div class="stat-label">摄影</div>
            </div>
            <div class="stat-item">
              <component class="user-icon-right" :is="NoteIcon" />
              <div class="stat-value">{{ notes.length }}</div>
              <div class="stat-label">随记</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部内容区域 -->
    <div class="bottom-section">
      <div class="tabs-header">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: currentTab === tab.key }]"
          @click="currentTab = tab.key"
        >
          {{ tab.label }}
        </div>
      </div>

      <div class="content-area">
        <div v-if="getContent(currentTab).length === 0" class="empty-state">
          <yk-empty
            :description="`暂无${
              currentTab === 'articles'
                ? '文章'
                : currentTab === 'photography'
                ? '摄影'
                : '随记'
            }内容`"
            type="secondary"
          />
        </div>
        <div v-else class="content-grid">
          <div
            v-for="item in getContent(currentTab)"
            :key="item.id"
            class="content-card"
          >
            <div class="content-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="content-info">
              <h3>{{ item.title }}</h3>
              <div class="content-meta">
                <span class="date">{{ formatDate(item.createdAt) }}</span>
                <span v-if="item.label" class="label-tag">{{
                  item.label
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="avatar-modal">
      <div
        v-if="showAvatarModal"
        class="modal-overlay"
        @click.self="showAvatarModal = false"
      >
        <div class="modal-content">
          <img :src="user?.avatar" alt="放大头像" class="modal-avatar" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosConfig from "../../utils/request";
import { YkEmpty } from "@yike-design/ui";
import BlogIcon from "../../components/icon/Blog.vue";
import PhotographyIcon from "../../components/icon/Photography.vue";
import NoteIcon from "../../components/icon/Note.vue";
import ConstellationIcon from "../../components/icon/Constellation.vue";
import BirthdayIcon from "../../components/icon/Birthday.vue";
import AreaIcon from "../../components/icon/Area.vue";
import IntroduceIcon from "../../components/icon/Introduce.vue";
import UuidIcon from "../../components/icon/Uuid.vue";
import {
  articles,
  photos,
  notes,
  type ContentItem,
} from "../../utils/publicuser";
import Constellation from "../../components/icon/Constellation.vue";
import Uuid from "../../components/icon/Uuid.vue";
import { loadUserContents } from "../../utils/publicuser";
interface User {
  id: number;
  avatar: string;
  nickname: string;
  area: string;
  birthday: Date;
  constellation: string;
  introduce: string;
  uuid: string;
  nicknameColor: string;
}
const showAvatarModal = ref(false); // 控制弹窗显示
const route = useRoute();
const user = ref<User | null>(null);
const currentTab = ref("articles");
const uuid = ref<string | string[]>();
const tabs = [
  { key: "articles", label: "文章" },
  { key: "photography", label: "摄影" },
  { key: "notes", label: "随记" },
];

const fetchUser = async () => {
  uuid.value = route.params.uuid;
  try {
    const response = await axiosConfig.get(`/admin/comment/user/${uuid.value}`);
    if (response.data && response.data.data) {
      user.value = response.data.data;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

const getContent = (type: string): ContentItem[] => {
  switch (type) {
    case "articles":
      return articles.value;
    case "photography":
      return photos.value;
    case "notes":
      return notes.value;
    default:
      return [];
  }
};
const handleAvatarClick = () => {
  showAvatarModal.value = true;
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

onMounted(() => {
  fetchUser();
  loadUserContents();
});
</script>
<style scoped lang="less">
@import "../../base-ui/userdetails.less";
.user-details-container {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.top-section {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.left-info {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 300px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 400px;
  height: 400px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.user-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname-uuid {
  margin-bottom: 10px;
}

.nickname {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.uuid {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.introduce {
  font-size: 15px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
}

.loading {
  font-size: 16px;
  color: #999;
}

.right-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.info-item {
  font-size: 15px;
  color: #444;
  display: flex;
  align-items: center;
}

.stats-list {
  display: flex;
  gap: 30px;
  justify-content: space-evenly;
  margin-top: 10px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #888;
}

.bottom-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tabs-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tab-item {
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  color: #555;

  &.active {
    color: #4facfe;
    border-color: #4facfe;
    font-weight: bold;
  }

  &:hover {
    color: #4facfe;
  }
}

.content-area {
  flex-grow: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #aaa;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.content-card {
  background-color: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
}

.content-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.content-info {
  padding: 15px;
}

.content-info h3 {
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #333;
}

.content-meta {
  font-size: 13px;
  color: #888;
  display: flex;
  gap: 10px;
  align-items: center;
}

.label-tag {
  background-color: #e0ffe0;
  color: #2c7a2c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.user-icon-left {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  font-size: 18px;
  vertical-align: middle;
}
.uuid-text,
.introduce-text {
  margin-top: 5px;
}
.user-icon-right {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-right: 6px;
  font-size: 18px;
  vertical-align: middle;
  margin-left: 6px;
}
</style>
