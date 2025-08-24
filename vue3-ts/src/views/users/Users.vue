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
                  <span
                    v-if="user.uuid !== String(userStore.user.uuid)"
                    @click="reportComment()"
                    style="margin-left: 10px; font-size: 20px; color: #ff4d4f"
                    >举报</span
                  >
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
              <div class="stat-value">{{ essay.length }}</div>
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
        <template v-if="contentLoading">
          <div class="loading-state">
            <yk-empty description="加载中..." type="secondary" />
          </div>
        </template>

        <template v-else>
          <div v-if="getCurrentTabContent().length === 0" class="empty-state">
            <yk-empty
              :description="`暂无${
                currentTab === 'essay'
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
              v-for="item in getCurrentTabContent()"
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
        </template>
      </div>
    </div>
    <!-- 举报弹窗 -->
    <transition name="modal-fade">
      <div v-if="showReportModal" class="report-modal-overlay">
        <div class="report-modal-container">
          <div class="report-modal-header">
            <h3>举报用户 {{ user?.nickname }}</h3>
            <button class="close-btn" @click="cancelReport">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>
          <div class="report-modal-body">
            <div class="report-reason-section">
              <h4>请选择举报原因 <span class="required">*</span></h4>
              <div class="reason-grid">
                <div
                  v-for="reason in reportReasons"
                  :key="reason.value"
                  class="reason-card"
                  :class="{ selected: reportReason === reason.value }"
                  @click="reportReason = reason.value"
                >
                  <span class="reason-text">{{ reason.label }}</span>
                </div>
              </div>
            </div>

            <div class="report-description-section">
              <h4>详细描述 <span class="required">*</span></h4>
              <div class="description-counter">
                <span>{{ reportDescription.length }}/100</span>
              </div>
              <textarea
                v-model="reportDescription"
                placeholder="请尽可能详细描述举报内容，这将帮助我们更快处理您的举报（100字以内）"
                maxlength="100"
                @input="handleDescriptionInput"
              ></textarea>
            </div>
          </div>

          <div class="report-modal-footer">
            <button class="cancel-btn" @click="cancelReport">取消</button>
            <button
              class="submit-btn"
              :class="{ disabled: !canSubmit }"
              :disabled="!canSubmit"
              @click="submitReport"
            >
              <span v-if="!submitting">提交</span>
              <span v-else class="loading">
                <svg class="spinner" viewBox="0 0 50 50">
                  <circle
                    class="path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke-width="5"
                  ></circle>
                </svg>
                处理中...
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
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
import Constellation from "../../components/icon/Constellation.vue";
import Uuid from "../../components/icon/Uuid.vue";
import { useUserStore } from "../../store/userStore";
import { ElMessage } from "element-plus";
import { el } from "date-fns/locale";
const userStore = useUserStore();
const loadmore = ref(false);
import { modelURL } from "../../config";
import { useRouter } from "vue-router";
const router = useRouter();
import { type ContentItem, type User } from "../../types/user";
import { useReportUser } from "../../hooks/useReportUser";
const {
  showReportModal,
  reportReasons,
  reportReason,
  reportDescription,
  canSubmit,
  submitting,
  submitReport,
  cancelReport,
  handleDescriptionInput,
} = useReportUser();
const essay = ref<ContentItem[]>([]);
const photos = ref<ContentItem[]>([]);
const notes = ref<ContentItem[]>([]);
const showAvatarModal = ref(false); // 控制弹窗显示
const route = useRoute();
const user = ref<User | null>(null);

const currentTab = ref("essay");
const uuid = ref<string | string[]>();
const tabs = [
  { key: "essay", label: "文章" },
  { key: "photography", label: "摄影" },
  { key: "notes", label: "随记" },
];
const contentLoading = ref(false);

const reportComment = () => {
  showReportModal.value = true;
};

const loadUserContents = async () => {
  contentLoading.value = true;
  const uuidValue = Array.isArray(route.params.uuid)
    ? route.params.uuid[0]
    : route.params.uuid;

  if (!uuidValue) {
    console.error("用户UUID不存在");
    contentLoading.value = false;
    return;
  }

  try {
    const fetchData = (type: string) =>
      axiosConfig.get(`/admin/${type}/user/${uuidValue}`);
    const [articleRes, photoRes, noteRes] = await Promise.all([
      fetchData("article"),
      fetchData("photography"),
      fetchData("note"),
    ]);

    // 更安全的数据访问
    essay.value = articleRes.data?.data?.articles || [];
    photos.value = photoRes.data?.data?.photos || [];
    notes.value = noteRes.data?.data?.notes || [];
    console.log(essay.value);

    // 如果需要在有数据时执行特定操作
    const totalContentCount =
      essay.value.length + photos.value.length + notes.value.length;
    if (totalContentCount > 0) {
      // 有数据时执行的操作
      console.log(`加载了 ${totalContentCount} 条内容`);
    } else {
      // 无数据时的处理
      console.log("用户暂无发布内容");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    console.error("加载用户内容失败:", errorMessage);
    // 出错时也设为空数组，确保UI正常显示
    essay.value = [];
    photos.value = [];
    notes.value = [];
  } finally {
    contentLoading.value = false;
  }
};

const fetchUser = async () => {
  uuid.value = route.params.uuid;

  try {
    const response = await axiosConfig.get(`/admin/comment/user/${uuid.value}`);
    user.value = response.data.data;
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const getCurrentTabContent = (): ContentItem[] => {
  switch (currentTab.value) {
    case "essay":
      return essay.value;
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
watch(
  () => route.params.uuid,
  (newUuid) => {
    uuid.value = newUuid;
    fetchUser();
    loadUserContents();
  },
  { immediate: true }
);
</script>

<style scoped lang="less">
@import "../../base-ui/userdetails.less";
@import "../../base-ui/reportuser.less";
</style>
