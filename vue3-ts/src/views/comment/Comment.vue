<template>
  <div class="comment-container">
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
        <div
          class="preview-card"
          :style="{
            background: selectedBackground,
            backgroundSize: 'contain',
            backgroundPosition: 'right',
            backgroundRepeat: 'no-repeat',
          }"
        >
          <div class="preview-content">
            <div class="preview-user-info">
              <img
                :src="
                  userStore.user?.avatar ||
                  'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                "
                class="preview-avatar"
              />
              <!-- 删除评论 -->
              <div class="user-detail">
                <span class="preview-time"
                  >{{ formatDate(new Date()) }} 评论背景卡预览状态</span
                >
                <div class="preview-name-area">
                  <span
                    class="preview-username"
                    :style="{ color: userStore.user?.nicknameColor || '#000' }"
                    >{{ userStore.user?.nickname || "默认用户" }}</span
                  >
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
          <div
            class="preview-actions"
            style="display: flex; justify-content: flex-end"
          >
            <div type="text" style="margin-right: 10px">
              <HeartOutlined style="color: #ff4d4f; margin: 0 5px" />
              <span>{{ 520 }}</span>
            </div>
            <!-- 评论按钮 -->
            <div type="text">
              <MessageOutlined style="color: #666; margin: 0 5px" />
              <span>{{ 1314 }}</span>
            </div>
          </div>
          <el-button type="text" class="clear-bg" @click="clearBackground">
            <CloseOutlined /> 清除背景
          </el-button>
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
import {
  HeartOutlined,
  MessageOutlined,
  SmileOutlined,
  LinkOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
const router = useRouter();
const userStore = useUserStore();
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
// 清除背景方法
const clearBackground = () => {
  selectedBackground.value = null;
  selectedBgId.value = null;
};
// 获取评论列表
const fetchComments = async () => {
  try {
    loadmore.value = false; // 开始加载时设置为 false
    const response = await axiosConfig.get(`/admin/comment/${messageId}`);
    console.log(response);

    commentList.value = response.data.data.comments.map((comment: any) => ({
      ...comment,
    }));
    console.log(response);

    loadmore.value = true; // 数据加载完成后设置为 true
  } catch (error) {
    console.error("获取评论失败:", error);
    ElMessage.error("获取评论失败");
    loadmore.value = true; // 即使失败也要设置为 true，避免永久加载状态
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
  } catch (error) {
    console.error("删除评论失败:", error);
    ElMessage.error("删除评论失败");
  }
};
const getUser = (uuid: string) => {
  if (commentList.value.length > 0) {
    const firstComment = commentList.value.find((c) => c.userId === uuid);
    if (firstComment && firstComment.uuid) {
      router.push({
        name: "users",
        params: { uuid: String(firstComment.uuid) },
      });

      // 跳转到用户详情页
      console.log("用户详情页跳转成功", firstComment.uuid);
    } else {
      ElMessage.warning("未找到对应用户的评论数据");
    }
  } else {
    ElMessage.warning("当前无评论数据");
  }
};
// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning("请输入评论内容");
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
  } catch (error) {
    console.error("提交评论失败:", error);
    ElMessage.error("提交评论失败");
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
  } catch (error) {
    console.error("点赞评论/取消点赞评论失败", error);
    ElMessage.error("点赞评论/取消点赞评论失败，请稍后再试");
  }
};
const chatComment = async (commentId: any) => {
  // const comment = commentList.value.find((c) => c.id === commentId);
  // if (comment) {
  //   replyToUsername.value = comment.username; // 设置回复用户名
  //   commentContent.value = ""; // 清空输入框内容
  ElMessage.info("该功能还在开发中，敬请期待！");
  // }
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
