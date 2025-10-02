<template>
  <div class="system-notification-detail">
    <div class="notification-header">
      <h1 class="notification-title">{{ currentUpdate?.title }}</h1>
      <div class="notification-meta">
        <el-tag type="info" class="meta-item" size="large">
          <el-icon><calendar /></el-icon>
          {{ currentUpdate?.formattedCreatedAt }}
        </el-tag>
        <el-tag type="success" class="meta-item" size="large">
          <el-icon><promotion /></el-icon>
          系统通知
        </el-tag>
      </div>
    </div>

    <div class="notification-card">
      <div class="card-header">
        <div class="sender-avatar">
          <img
            @click="openAuthorProfile"
            class="system-avatar"
            v-if="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            v-lazy="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            alt="头像"
            :title="`用户${user?.nickname || '默认用户'}的头像`"
          />
        </div>
        <div class="sender-info">
          <h2 class="sender-title">系统通知</h2>
          <p class="sender-subtitle">来自系统管理员</p>
        </div>
      </div>

      <div class="card-content">
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon color="#67C23A" :size="24"><User /></el-icon>
            </div>
            <div class="feature-text">
              <h3>账号切换</h3>
              <p @click="changeAccount">快速切换已登录账号</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon color="#67C23A" :size="24"><monitor /></el-icon>
            </div>
            <div class="feature-text">
              <h3>登录界面</h3>
              <p>展示最近登录账号 {{ user?.username }}</p>
            </div>
          </div>
        </div>

        <div class="update-content" v-html="formattedContent"></div>
      </div>

      <div class="card-footer">
        <el-divider />
        <div class="action-buttons">
          <el-button type="primary" round @click="backToList">
            <el-icon><back /></el-icon>返回列表
          </el-button>
          <el-button round @click="shareEmail">
            <el-icon><share /></el-icon>分享
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Calendar,
  Promotion,
  Back,
  Share,
  User,
  Monitor,
} from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";
import { ElMessage } from "element-plus";
import { type SystemUpdate } from "../../types/viewsystememail";
const userStore = useUserStore();
const { openAuthorProfile } = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();
const router = useRouter();
const currentUpdate = ref<SystemUpdate | null>(null);

const formattedContent = computed(() => {
  if (!currentUpdate.value?.content) return "";
  return `<p class="formatted-text">${currentUpdate.value.content}</p>`;
});

const changeAccount = () => {
  router.push({
    path: "/setting/toggleaccount",
  });
};
const getAllUpdates = async () => {
  try {
    const response = await axiosConfig.get(`/admin/update/${route.params.id}`);
    currentUpdate.value = response.data.data;
  } catch (error) {
    console.error("获取更新详情失败:", error);
  }
};

const backToList = () => {
  router.push({ name: "home" });
};

const shareEmail = () => {
  ElMessage.info("该功能正在努力开发中，敬请期待！");
};

onMounted(() => {
  getAllUpdates();
});
</script>

<style scoped lang="less">
.system-notification-detail {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .notification-header {
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg2);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .notification-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-bg3);
      margin-bottom: 16px;
    }

    .notification-meta {
      display: flex;
      gap: 12px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        padding: 8px 12px;
      }
    }
  }

  .notification-card {
    background: var(--bg2);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
      padding: 32px;
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--bg2);

      .sender-avatar {
        .system-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .sender-info {
        .sender-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--color-bg3);
          margin: 0 0 4px 0;
        }

        .sender-subtitle {
          font-size: 14px;
          color: var(--color-bg3);
          margin: 0;
        }
      }
    }

    .card-content {
      padding: 32px;

      .feature-list {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin-bottom: 32px;

        .feature-item {
          flex: 1;
          min-width: 280px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: var(--bg2);
          border: 1px solid #fff;
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .feature-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: var(--bg3);
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .feature-text {
            h3 {
              font-size: 18px;
              font-weight: 600;
              color: var(--color-bg3);
              margin: 0 0 8px 0;
            }

            p {
              font-size: 14px;
              color: var(--color-bg3);
              margin: 0;
              line-height: 1.6;
            }
          }
        }
      }

      .update-content {
        line-height: 1.8;
        font-size: 16px;
        color: var(--color-bg3);

        :deep(.formatted-text) {
          white-space: pre-line;
        }
      }
    }

    .card-footer {
      padding: 0 32px 32px;

      .action-buttons {
        display: flex;
        gap: 16px;

        .el-button {
          padding: 12px 24px;
          font-size: 14px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .system-notification-detail {
    padding: 16px;

    .notification-header {
      padding: 16px;

      .notification-title {
        font-size: 22px;
      }

      .notification-meta {
        flex-direction: column;
        gap: 8px;
      }
    }

    .notification-card {
      .card-header {
        padding: 24px;
        flex-direction: column;
        text-align: center;

        .sender-avatar {
          margin-bottom: 16px;
        }
      }

      .card-content {
        padding: 24px;

        .feature-list {
          flex-direction: column;
          gap: 16px;
        }
      }

      .card-footer {
        padding: 0 24px 24px;
      }
    }
  }
}
</style>
