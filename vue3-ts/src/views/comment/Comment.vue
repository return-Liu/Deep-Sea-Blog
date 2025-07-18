<template>
  <div class="comment-container">
    <!-- 优化和更新 -->
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
        <span class="comment-count">{{ commentList.length }} 条评论</span>
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
          :placeholder="inputPlaceholder"
          @keydown.enter="submitComment"
          title="按下回车发送评论"
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
                  :style="{ background: bg.gradient }"
                  :title="bg.name"
                ></div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <!-- 评论背景卡预览状态 -->
      <div class="comment-bg-preview" v-if="selectedBackground">
        <div class="preview-card" :style="{ background: selectedBackground }">
          <div class="preview-content">
            <div class="preview-user-info">
              <img
                :src="
                  userStore.user?.avatar ||
                  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                "
                class="preview-avatar"
              />
              <div class="user-detail">
                <span class="preview-time"
                  >{{ formatDate(new Date()) }} 评论背景卡预览状态</span
                >
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
                  commentContent ||
                  "选择专属评论背景卡，让你的评论与众不同被看见哦~"
                }}
              </div>
            </div>
          </div>
          <!-- 爱心点赞按钮 -->
          <div class="preview-actions">
            <div class="action-item like">
              <HeartOutlined style="color: #ff4d4f; margin: 0 5px" />
              <span>520</span>
            </div>
            <!-- 评论按钮 -->
            <div class="action-item reply">
              <MessageOutlined style="color: #666; margin: 0 5px" />
              <span>1314</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 骨架屏加载状态 -->
    <el-skeleton :loading="!loadmore" animated>
      <template #template>
        <div class="comment-loading">
          <div v-for="i in skeletonCount" :key="i" class="skeleton-item">
            <div
              style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 20px;
              "
            >
              <el-skeleton-item
                variant="circle"
                style="width: 40px; height: 40px; margin-right: 16px"
              />
              <div style="flex: 1">
                <div
                  style="display: flex; align-items: center; margin-bottom: 8px"
                >
                  <el-skeleton-item
                    variant="text"
                    style="width: 100px; margin-right: 10px"
                  />
                  <el-skeleton-item variant="text" style="width: 60px" />
                </div>
                <el-skeleton-item variant="text" style="width: 100%" />
                <el-skeleton-item variant="text" style="width: 80%" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="load-more" v-if="commentList.length">
          <div class="comment-list">
            <div>
              <div
                class="comment-item"
                v-for="comment in commentList"
                :key="comment.id"
                :style="{
                  background: comment.commentbackground,
                  backgroundSize: 'contain',
                  backgroundPosition: 'right',
                  backgroundRepeat: 'no-repeat',
                }"
              >
                <div class="comment-user">
                  <img
                    v-if="comment.useravatar"
                    v-lazy="comment.useravatar"
                    :title="`用户${comment.username}的头像`"
                    @click="getUser(comment.userId)"
                    style="
                      width: 40px;
                      height: 40px;
                      cursor: pointer;
                      border-radius: 20px;
                    "
                  />

                  <div class="user-info">
                    <span class="comment-time">{{
                      formatDate(comment.createdAt)
                    }}</span>
                    <span
                      :style="{ color: comment.nicknameColor }"
                      class="username"
                      >{{ comment.username }}</span
                    >
                    <span class="area">来自{{ comment.area || "未知" }}</span>
                    <span
                      v-if="userStore.user.id === Number(comment.userId)"
                      @click="deleteComment(comment.id)"
                      style="margin-left: 10px; font-size: 12px; color: #ff4d4f"
                      >删除</span
                    >
                  </div>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
                <!-- 点赞评论  回复评论  -->
                <div class="comment">
                  <div
                    class="comment-like"
                    @click="likeComment(comment.id)"
                    :title="comment.likesCount ? '取消喜欢' : '喜欢'"
                  >
                    <HeartOutlined style="color: #ff4d4f" />
                    <div class="likes-count">{{ comment.likesCount || 0 }}</div>
                  </div>
                  <div class="comment-reply" @click="chatComment(comment.id)">
                    <MessageOutlined style="color: #666" />
                    <span class="reply-count">回复</span>
                  </div>
                </div>
                <!-- 显示当前回复的评论-->
              </div>
            </div>
          </div>
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
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElSkeleton, ElSkeletonItem } from "element-plus";
import axiosConfig from "../../utils/request";
import { useRoute } from "vue-router";
import { YkEmpty } from "@yike-design/ui";
import { useUserStore } from "../../store/userStore";
import { backgrounds as bgList } from "../../utils/backgrounds";
import { emojis } from "../../utils/emojis";
import { modelURL } from "../../config";
import {
  HeartOutlined,
  MessageOutlined,
  SmileOutlined,
  LinkOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { log } from "console";
const router = useRouter();
const userStore = useUserStore();
console.log(userStore);

interface Comment {
  id: number;
  username: string;
  useravatar: string;
  content: string;
  createdAt: Date;
  likesCount: string;
  area: string;
  userId: string;
  commentbackground: string;
  nicknameColor: string;
  uuid: string;
}
const showBg = ref(false);
const route = useRoute();
const messageId = route.params.messageId as string;
const commentList = ref<Comment[]>([]);
const loadmore = ref(false);
const commentContent = ref("");
const submitting = ref(false);
const showEmoji = ref(false);
const selectedBgId = ref<number | null>(null);
const selectedBackground = ref<string | null>(null);
const backgrounds = ref(bgList);
const replyToUsername = ref<string | null>(null);
const emoji = ref("表情包");
const comment = ref("评论背景卡");
// 计算属性用于骨架屏数量
const skeletonCount = computed(() => {
  // 如果还没有获取到评论列表,默认空
  return commentList.value.length || "";
});

// 插入表情
const insertEmoji = (emoji: string) => {
  commentContent.value += emoji;
};
const selectBackground = (bg: (typeof backgrounds.value)[0]) => {
  selectedBackground.value = bg.gradient;
  selectedBgId.value = bg.id; // 更新选中的背景ID
  showBg.value = false;
};
// 获取评论列表（维护中时禁止请求）
const fetchComments = async () => {
  try {
    loadmore.value = false;

    const response = await axiosConfig.get(`/admin/comment/${messageId}`);

    // 更新评论列表
    commentList.value =
      response.data.data?.comments?.map((comment: any) => ({
        ...comment,
      })) || [];

    loadmore.value = true;
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
    commentList.value = []; // 清空列表，避免旧数据残留
    loadmore.value = true;
  }
};
// 获取回复评论
const fetchReplies = async (commentId: number) => {};
const deleteComment = async (commentId: number) => {
  try {
    const response = await axiosConfig.delete(
      `/admin/comment/comment/${commentId}`
    );
    ElMessage.success(response.data.message);
    // 重新获取评论列表
    await fetchComments();
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const getUser = (uuid: string) => {
  checkMaintenanceMode();
};
// 检查是否处于维护模式，如果是则提示并阻止后续操作
const checkMaintenanceMode = () => {
  if (modelURL === "true") {
    loadmore.value = true;
    ElMessage.warning("我们正在努力升级服务，请稍后再来查看~");
    return true; // 表示处于维护模式
  }
  return false; // 不在维护模式中
};
// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }
  if (checkMaintenanceMode()) {
    return;
  }
  submitting.value = true;

  try {
    const { id } = userStore.user;
    let url, payload;

    if (replyToUsername.value) {
      // 回复评论
      url = "/admin/replycomment";
      const targetComment = commentList.value.find(
        (c) => c.username === replyToUsername.value
      );
      if (!targetComment) {
        ElMessage.error("目标评论不存在");
        return;
      }
      payload = {
        commentId: targetComment.id,
        userId: id,
        replyUserId: targetComment.userId, // 回复的用户ID
        content: commentContent.value,
      };
    } else {
      // 普通评论
      url = `/admin/comment/${messageId}`;
      payload = {
        content: commentContent.value,
        userId: id,
        commentbackground: selectedBackground.value || "",
      };
    }

    await axiosConfig.post(url, payload);

    ElMessage.success(
      replyToUsername.value
        ? `回复 ${replyToUsername.value} 的评论成功`
        : "评论提交成功"
    );
    commentContent.value = "";
    selectedBackground.value = null;
    replyToUsername.value = null;
    await fetchComments();
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
};
// 点赞
const likeComment = async (commentId: any) => {
  try {
    const { id } = userStore.user;
    const response = await axiosConfig.post("/admin/likescomment/like", {
      userId: id,
      commentId: commentId,
    });
    // 获取当前点赞数
    const newLikeCount = response.data.data.likeCount;
    // 更新具体评论的 likesCount
    commentList.value = commentList.value.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, likesCount: newLikeCount };
      }
      return comment;
    });
    ElMessage.success(response.data.message);
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const chatComment = async (commentId: any) => {
  checkMaintenanceMode();
};
const inputPlaceholder = computed(() => {
  return replyToUsername.value
    ? `回复${replyToUsername.value}`
    : "期待你的神评论";
});

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("zh-CN");
};

onMounted(async () => {
  await fetchComments();
  if (commentList.value.length > 0) {
    const firstCommentId = commentList.value[0].id;
    await fetchReplies(firstCommentId);
  }
});
</script>
<style scoped lang="less">
@import "../../base-ui/comments.less";
</style>
