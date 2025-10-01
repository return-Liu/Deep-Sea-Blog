<template>
  <div class="comment-item" :class="`comment-level-${level}`">
    <!-- 主评论内容 -->
    <div
      class="comment-main"
      :style="{ background: comment.commentbackground }"
    >
      <div class="comment-user">
        <img
          :src="comment.useravatar || defaultAvatar"
          class="comment-avatar"
          @click="getUser(comment.uuid)"
        />
        <div class="user-info">
          <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          <span class="username" :style="{ color: comment.nicknameColor }">{{
            comment.username
          }}</span>
          <span class="area">来自{{ comment.area || "未知" }}</span>
          <span style="color: red"></span>
          <span
            v-if="userStore.user.id === Number(comment.userId)"
            @click="deleteComment(comment.id)"
            class="delete-btn"
            >删除</span
          >
          <span
            v-if="userStore.user.id !== Number(comment.userId)"
            @click="reportComment()"
            class="report-btn"
            >举报</span
          >
        </div>
      </div>

      <div class="comment-content">{{ comment.content }}</div>

      <div class="comment-actions">
        <div
          v-if="userStore.user.id !== Number(comment.userId)"
          class="comment-like"
          @click="likeComment(comment.id)"
          :title="comment.likesCount ? '取消喜欢' : '喜欢'"
        >
          <HeartOutlined
            :style="{
              color: comment.likesCount ? '#ff4d4f' : '#666',
            }"
          />
          <span class="likes-count">{{ comment.likesCount || 0 }}</span>
        </div>
        <div
          class="comment-reply"
          v-if="userStore.user.id !== Number(comment.userId)"
          @click="showReplyInput(comment.id, comment.username)"
        >
          <MessageOutlined style="color: #666" />
          <span class="reply-text">回复</span>
        </div>
      </div>
    </div>
    <!-- 回复列表 -->
    <div
      class="replies-container"
      v-if="comment.replies && comment.replies.length > 0"
    >
      <template v-for="(reply, index) in visibleReplies">
        <CommentItem
          v-if="index < visibleReplyCount || showAllReplies"
          :key="reply.id"
          :comment="reply"
          :level="level + 1"
          @refresh-comments="refreshComments"
          @report-comment="reportComment"
        />
      </template>

      <!-- 显示更多按钮 -->
      <div
        class="show-more-replies"
        v-if="comment.replies.length > visibleReplyCount && !showAllReplies"
        @click="showAllReplies = true"
      >
        展开剩余 {{ comment.replies.length - visibleReplyCount }} 条回复
        <DownOutlined style="margin-left: 5px; font-size: 12px" />
      </div>

      <!-- 收起按钮 -->
      <div
        class="show-more-replies"
        v-if="comment.replies.length > visibleReplyCount && showAllReplies"
        @click="showAllReplies = false"
      >
        收起回复
        <UpOutlined style="margin-left: 5px; font-size: 12px" />
      </div>
    </div>

    <div class="reply-form" v-if="activeReplyId === comment.id">
      <div class="input-wrapper">
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="2"
          :maxlength="500"
          show-word-limit
          :placeholder="`回复 ${replyToUsername}：按 Enter 发送，按 Esc 取消回复`"
          @keydown="handleReplyKeydown"
        />

        <!-- 回复表情包 -->
        <div class="emoji-trigger" title="表情包">
          <el-popover
            placement="top"
            :width="300"
            trigger="click"
            v-model="showReplyEmoji"
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
                @click="insertReplyEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </el-popover>
        </div>

        <!-- 回复背景卡 -->
        <div class="bg-trigger" title="评论背景卡">
          <el-popover
            placement="top"
            :width="400"
            trigger="click"
            v-model="showReplyBg"
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
                :class="{
                  'bg-item-selected': replySelectedBgId === bg.id,
                }"
                @click="selectReplyBackground(bg)"
              >
                <div
                  class="bg-preview"
                  :style="{ background: bg.gradient }"
                  :title="bg.name"
                ></div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <!-- 回复背景卡预览 -->
      <div class="comment-bg-preview" v-if="replySelectedBackground">
        <div
          class="preview-card"
          :style="{ background: replySelectedBackground }"
        >
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
                    >来自{{ userStore.user?.area || "未知" }}</span
                  >
                </div>
              </div>
            </div>
            <div class="preview-text">
              <div class="preview-message">
                {{
                  replyContent ||
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
    <transition name="modal-fade">
      <div v-if="showReportModal" class="report-modal-overlay">
        <div class="report-modal-container">
          <div class="report-modal-header">
            <h3>举报用户 {{ comment.username }}</h3>
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

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import axiosConfig from "../../utils/request";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../../store/userStore";
import { backgroundes } from "../../utils/backgrounds";
import { emojis } from "../../utils/emojis";
import {
  HeartOutlined,
  MessageOutlined,
  SmileOutlined,
  LinkOutlined,
} from "@ant-design/icons-vue";

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});
const showReportModal = ref(false);
const reportReason = ref("");
const reportDescription = ref("");
const submitting = ref(false);
const emit = defineEmits(["refreshComments", "reportComment"]);

const defaultAvatar =
  "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
// 用户相关
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const messageId = route.params.messageId as string;

// 回复相关
const activeReplyId = ref<number | null>(null);
const replyContent = ref("");
const replyToUsername = ref("");
const showReplyEmoji = ref(false);
const showReplyBg = ref(false);
const replySelectedBgId = ref<number | null>(null);
const replySelectedBackground = ref<string | null>(null);
const backgrounds = ref(backgroundes);

// 显示回复输入框
const showReplyInput = (targetId: number, username: string) => {
  activeReplyId.value = targetId;
  replyToUsername.value = username;
};
const reportReasons = [
  { value: "spam", label: "垃圾营销" },
  { value: "porn", label: "色情低俗" },
  { value: "attack", label: "人身攻击" },
  { value: "violence", label: "暴力恐怖" },
  { value: "fake", label: "不实信息" },
  { value: "other", label: "其他" },
];

// 计算属性：是否可以提交
const canSubmit = computed(() => {
  return (
    reportReason.value && reportDescription.value.trim() && !submitting.value
  );
});

// 处理描述输入
const handleDescriptionInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  reportDescription.value = target.value;
};

// 取消举报
const cancelReport = () => {
  showReportModal.value = false;
  reportReason.value = "";
  reportDescription.value = "";
};

// 提交举报
const submitReport = async () => {
  if (!canSubmit.value) return;

  try {
    submitting.value = true;

    ElMessage.success("举报成功，我们会尽快处理");
    cancelReport();
  } catch (error) {
    ElMessage.error("举报失败，请稍后再试");
  } finally {
    submitting.value = false;
  }
};
// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning("请输入回复内容");
    return;
  }

  try {
    const { id } = userStore.user;

    const response = await axiosConfig.post(
      `/admin/comment/replyComment/${messageId}`,
      {
        content: replyContent.value,
        userId: id,
        parentId: props.comment.id,
        replyTo: replyToUsername.value,
        commentbackground: replySelectedBackground.value || "",
      }
    );

    ElMessage.success(response.data.message);
    // 重置状态
    activeReplyId.value = null;
    replyContent.value = "";
    replySelectedBackground.value = null;
    replySelectedBgId.value = null;

    // 触发刷新评论列表
    emit("refreshComments");
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message || error?.message || "回复失败"
    );
  }
};

// 删除评论
const deleteComment = async (commentId: number) => {
  try {
    await axiosConfig.delete(`/admin/comment/comment/${commentId}`);
    ElMessage.success("删除成功");
    emit("refreshComments");
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message || error?.message || "删除失败"
    );
  }
};

// 点赞评论
const likeComment = async (commentId: number) => {
  try {
    const { id } = userStore.user;
    await axiosConfig.post("/admin/likescomment/like", {
      userId: id,
      commentId,
    });

    // 触发刷新评论列表
    emit("refreshComments");
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message || error?.message || "操作失败"
    );
  }
};

// 控制显示回复的数量
const visibleReplyCount = 2;
const showAllReplies = ref(false);

// 计算可见的回复
const visibleReplies = computed(() => {
  if (
    showAllReplies.value ||
    props.comment.replies.length <= visibleReplyCount
  ) {
    return props.comment.replies;
  }
  return props.comment.replies.slice(0, visibleReplyCount);
});
// 举报评论
const reportComment = () => {
  showReportModal.value = true;
};

// 键盘事件处理
const handleReplyKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    activeReplyId.value = null;
  } else if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitReply();
  }
};

// 辅助函数
// 在 script setup 部分添加
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const insertReplyEmoji = (emoji: string) => {
  replyContent.value += emoji;
  showReplyEmoji.value = false;
};

const selectReplyBackground = (bg: any) => {
  replySelectedBackground.value = bg.gradient;
  replySelectedBgId.value = bg.id;
  showReplyBg.value = false;
};

const getUser = (uuid: string) => {
  router.push({ path: `/users/${uuid}` });
};

const refreshComments = () => {
  emit("refreshComments");
};
</script>

<style scoped lang="less">
@import "../../base-ui/commentitem.less";
@import "../../base-ui/reportuser.less";
</style>
