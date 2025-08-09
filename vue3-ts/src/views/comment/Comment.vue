<template>
  <div class="comment-container">
    <!-- 优化和更新提示 -->
    <el-alert
      title="评论功能正在持续优化中，敬请期待新版本"
      type="warning"
      :closable="false"
      style="margin-bottom: 20px"
    ></el-alert>

    <div class="comment-header">
      <h3 class="comment-title">
        <i class="el-icon-chat-dot-round"></i>
        留下你的足迹 让这里更有温度~
        <span class="comment-count">{{ totalComments }} 条评论</span>
      </h3>
    </div>

    <!-- 评论输入框 -->
    <div class="comment-form">
      <div class="input-wrapper">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          :maxlength="500"
          show-word-limit
          placeholder="期待你的神评论"
          @keydown="handleKeydown"
          title="按下回车发送评论，按下 Esc 取消回复"
        />

        <!-- 表情包 -->
        <div class="emoji-trigger" :title="emoji">
          <el-popover
            placement="top"
            :width="300"
            trigger="click"
            v-model="showEmoji"
          >
            <template #reference>
              <SmileOutlined
                style="color: #ff4d4f; cursor: pointer; font-size: 20px"
              />
            </template>
            <div class="emoji-container">
              <span
                v-for="(emoji, index) in emojis"
                :key="index"
                class="emoji-item"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </el-popover>
        </div>

        <!-- 评论卡背景 -->
        <div class="bg-trigger" :title="comment">
          <el-popover
            placement="top"
            :width="400"
            trigger="click"
            v-model="showBg"
          >
            <template #reference>
              <LinkOutlined
                style="color: #1890ff; cursor: pointer; font-size: 20px"
              />
            </template>
            <div class="bg-container">
              <div
                v-for="bg in backgrounds"
                :key="bg.id"
                class="bg-item"
                :class="{ 'bg-item-selected': selectedBgId === bg.id }"
                @click="selectBackground(bg)"
              >
                <div
                  class="bg-preview"
                  :style="{ background: bg.gradient ? bg.gradient : '#ccc' }"
                  :title="bg.name"
                ></div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <!-- 优化评论背景卡预览 -->
      <div class="comment-bg-preview" v-if="selectedBackground">
        <div class="preview-card" :style="{ background: selectedBackground }">
          <div class="preview-content">
            <div class="preview-user-info">
              <img
                :src="userStore.user?.avatar || defaultAvatar"
                class="preview-avatar"
              />
              <div class="user-detail">
                <div class="preview-header">
                  <span class="preview-time">{{ formatDate(new Date()) }}</span>
                </div>
                <div class="preview-name-area">
                  <span
                    class="preview-username"
                    :style="{ color: userStore.user?.nicknameColor || '#000' }"
                  >
                    {{ userStore.user?.nickname || "默认用户" }}
                  </span>
                  <span class="preview-area"
                    >来自{{ userStore.user?.area || "未知" }} 背景预览状态</span
                  >
                </div>
              </div>
            </div>
            <div class="preview-text">
              <div class="preview-message">
                {{
                  commentContent ||
                  "选择专属评论背景卡，让你的评论与众不同被看见哦~"
                }}
              </div>
            </div>
          </div>
          <div class="preview-actions">
            <div class="action-item like">
              <HeartOutlined style="color: #ff4d4f; margin: 0 5px" />
              <span>520</span>
            </div>
            <div class="action-item reply">
              <MessageOutlined style="color: #666; margin: 0 5px" />
              <span>1314</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-wrapper">
      <el-skeleton :loading="loading" animated :count="3">
        <template #template>
          <div class="skeleton-item">
            <el-skeleton-item
              variant="circle"
              style="width: 40px; height: 40px; margin-right: 16px"
            />
            <div style="flex: 1">
              <el-skeleton-item
                variant="text"
                style="width: 100px; margin-bottom: 8px"
              />
              <el-skeleton-item variant="text" style="width: 100%" />
              <el-skeleton-item variant="text" style="width: 80%" />
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="commentList.length > 0" class="comment-list">
            <CommentItem
              v-for="comment in commentList"
              :key="comment.id"
              :comment="comment"
              :level="0"
              @refresh-comments="fetchComments"
              @report-comment="reportComment"
            />
          </div>

          <div v-else class="no-comment">
            <yk-empty
              description="暂无评论，快来留下你的第一条评论吧~"
              type="secondary"
            />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElSkeleton, ElSkeletonItem } from "element-plus";
import axiosConfig from "../../utils/request";
import { useRoute, useRouter } from "vue-router";
import { YkEmpty } from "@yike-design/ui";
import { useUserStore } from "../../store/userStore";
import { backgroundes } from "../../utils/backgrounds";
import { emojis } from "../../utils/emojis";
import {
  HeartOutlined,
  MessageOutlined,
  SmileOutlined,
  LinkOutlined,
} from "@ant-design/icons-vue";
import CommentItem from "./CommentItem.vue"; // 引入递归组件
const replySelectedBackground = ref<string | null>(null);
const defaultAvatar =
  "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
// 用户相关
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const messageId = route.params.messageId as string;

// 评论数据
const commentList = ref<any[]>([]);
const loading = ref(true);
const totalComments = computed(() => {
  // 递归计算总评论数
  const countComments = (comments: any[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? countComments(comment.replies) : 0);
    }, 0);
  };

  return countComments(commentList.value);
});

// 评论输入
const commentContent = ref("");
const showEmoji = ref(false);
const showBg = ref(false);
const selectedBgId = ref<number | null>(null);
const selectedBackground = ref<string | null>(null);
const backgrounds = ref(backgroundes);
const emoji = ref("表情包");
const comment = ref("评论背景卡");

// 举报相关
const showReportModal = ref(false);
const currentReportedCommentId = ref<number | null>(null);
const currentReportedUsername = ref<string | null>(null);

// 获取评论列表
const fetchComments = async () => {
  try {
    loading.value = true;
    const response = await axiosConfig.get(`/admin/comment/${messageId}`);

    // 直接使用后端返回的嵌套结构
    commentList.value = response.data.data?.comments || [];
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message || error?.message || "获取评论失败"
    );
    commentList.value = [];
  } finally {
    loading.value = false;
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  try {
    const { id } = userStore.user;
    const payload = {
      content: commentContent.value,
      userId: id,
      commentbackground: selectedBackground.value || "",
    };

    await axiosConfig.post(`/admin/comment/${messageId}`, payload);
    ElMessage.success("评论提交成功");

    // 重置状态并刷新评论
    commentContent.value = "";
    selectedBackground.value = null;
    await fetchComments();
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message || error?.message || "评论失败"
    );
  }
};

// 举报评论
const reportComment = (commentId: number, username: string) => {
  currentReportedCommentId.value = commentId;
  currentReportedUsername.value = username;
  showReportModal.value = true;
};

const handleReportSubmit = async (reason: string, description: string) => {
  try {
    ElMessage.success("举报已提交，我们会尽快处理");
    showReportModal.value = false;
  } catch (error) {
    ElMessage.error("举报提交失败");
  }
};

const cancelReport = () => {
  showReportModal.value = false;
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitComment();
  }
};

// 辅助函数
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const insertEmoji = (emoji: string) => {
  commentContent.value += emoji;
  showEmoji.value = false;
};

const selectBackground = (bg: any) => {
  selectedBackground.value = bg.gradient;
  selectedBgId.value = bg.id;
  showBg.value = false;
};

const getUser = (uuid: string) => {
  router.push({ path: `/users/${uuid}` });
};

// 初始化
onMounted(() => {
  fetchComments();
});
</script>
<style scoped lang="less">
@import "../../base-ui/comments.less";
</style>
