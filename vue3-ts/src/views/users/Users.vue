<template>
  <div class="user-details-container">
    <!-- 顶部用户信息区域 -->
    <div class="top-section">
      <div class="user-profile">
        <div class="left-info">
          <div v-if="user" class="user-info">
            <div class="avatar-container">
              <img
                v-if="
                  user?.avatar ||
                  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                "
                v-lazy="
                  user?.avatar ||
                  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                "
                alt="头像"
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
import { ElMessage } from "element-plus";
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
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
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
</style>
