<template>
  <div class="security-center">
    <!-- 安全中心头部 -->
    <header class="security-header">
      <div class="header-container">
        <div class="user-profile-section">
          <div class="avatar-container" @click="openAuthorProfile">
            <el-avatar
              v-if="user?.avatar"
              :size="80"
              :src="user.avatar"
              :alt="`用户${user?.nickname || '默认用户'}的头像`"
              class="user-avatar"
            />
            <el-avatar v-else :size="80" class="user-avatar avatar-placeholder">
              {{ user?.nickname?.charAt(0) || "U" }}
            </el-avatar>
            <div class="avatar-overlay">
              <a-icon type="camera" class="camera-icon" />
            </div>
          </div>
          <div class="user-info">
            <h1
              class="user-name"
              :style="{ color: user?.nicknameColor || '#fff' }"
            >
              {{ user?.nickname }}
            </h1>
            <p class="user-description">
              <a-icon type="safety-certificate" class="desc-icon" />
              立即提升账号安全等级，快速掌握安全设置
            </p>
          </div>
        </div>

        <div class="security-score-section">
          <div class="score-display">
            <el-progress
              type="circle"
              :percentage="securityScore"
              :width="120"
              :stroke-width="10"
              :color="scoreColor"
              class="score-progress"
            >
              <template #default>
                <div class="score-content">
                  <div class="score-value">{{ securityScore }}</div>
                  <div class="score-label">安全评分</div>
                </div>
              </template>
            </el-progress>
            <div class="score-status">
              <el-tag
                :type="securityStatusType"
                effect="dark"
                class="status-tag"
              >
                {{ securityText }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 安全中心主要内容 -->
    <main class="security-main">
      <div class="main-container">
        <!-- 账号安全等级卡片 -->
        <section class="security-section">
          <el-card class="security-card level-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <a-icon type="safety" class="header-icon" />
                  <span class="header-title">账号安全等级</span>
                </div>
                <el-tag
                  :type="securityStatusType"
                  effect="light"
                  class="security-status"
                >
                  {{ securityText }}
                </el-tag>
              </div>
            </template>

            <div class="level-content">
              <div class="progress-section">
                <div class="progress-container">
                  <el-progress
                    :percentage="securityLevel"
                    :stroke-width="16"
                    :color="progressColor"
                    :show-text="false"
                    class="level-progress"
                  />
                  <div class="level-indicators">
                    <div
                      v-for="(mark, index) in levelMarks"
                      :key="index"
                      class="level-indicator"
                      :class="{ active: securityLevel >= mark.threshold }"
                    >
                      <div class="indicator-dot"></div>
                      <span class="indicator-text">
                        <a-icon :type="mark.icon" class="indicator-icon" />
                        {{ mark.label }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <el-divider direction="vertical" class="section-divider" />

              <div class="tips-section">
                <div class="tips-header">
                  <a-icon type="bulb" class="tips-icon" />
                  <span class="tips-title">安全建议</span>
                </div>
                <div class="tips-list">
                  <div
                    v-for="tip in securityTips"
                    :key="tip.id"
                    class="tip-item"
                    :class="{ completed: tip.completed }"
                  >
                    <div class="tip-check">
                      <a-icon
                        :type="
                          tip.completed ? 'check-circle' : 'exclamation-circle'
                        "
                        class="check-icon"
                      />
                    </div>
                    <span class="tip-text">{{ tip.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </section>

        <!-- 安全功能模块 -->
        <section class="security-section">
          <el-card class="security-card features-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <a-icon type="lock" class="header-icon" />
                  <span class="header-title">安全功能</span>
                </div>
              </div>
            </template>

            <div class="features-grid">
              <div
                v-for="feature in securityFeatures"
                :key="feature.id"
                class="feature-item"
                :class="{ completed: feature.completed }"
                @click="feature.handler"
              >
                <div class="feature-icon-container">
                  <div class="icon-wrapper">
                    <component :is="feature.icon" class="feature-icon" />
                  </div>
                </div>

                <div class="feature-content">
                  <h3 class="feature-title">{{ feature.title }}</h3>
                  <p class="feature-description">
                    {{
                      typeof feature.description === "function"
                        ? feature.description()
                        : feature.description
                    }}
                  </p>
                </div>

                <div class="feature-action">
                  <span class="action-text">{{ feature.actionText }}</span>
                  <a-icon type="arrow-right" class="action-icon" />
                </div>
              </div>
            </div>
          </el-card>
        </section>

        <!-- 安全风险提示 -->
        <section v-if="securityRisks.length > 0" class="security-section">
          <el-card class="security-card risks-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <a-icon type="warning" class="header-icon" />
                  <span class="header-title">安全风险提示</span>
                </div>
                <el-badge
                  :value="securityRisks.length"
                  type="danger"
                  class="risks-count"
                />
              </div>
            </template>

            <div class="risks-list">
              <div
                v-for="risk in securityRisks"
                :key="risk.id"
                class="risk-item"
              >
                <div class="risk-icon">
                  <a-icon type="exclamation-circle" />
                </div>
                <div class="risk-content">
                  <h4 class="risk-title">{{ risk.title }}</h4>
                  <p class="risk-description">{{ risk.description }}</p>
                </div>
                <el-button
                  type="warning"
                  size="small"
                  class="risk-action"
                  @click="handleRiskAction(risk)"
                >
                  {{ risk.action }}
                </el-button>
              </div>
            </div>
          </el-card>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// 保持原有的 script 逻辑完全不变
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  LockOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  RightOutlined,
  StarOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CameraOutlined,
  CheckOutlined,
  ExclamationOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons-vue";

// 导入原有图标组件
import FoundpasswordIcon from "../../components/icon/Foundpassword.vue";
import LogindevicemanageIcon from "../../components/icon/Logindevicemanage.vue";
import phoneIcon from "../../components/icon/phone.vue";
import rightarrowIcon from "../../components/icon/rightarrow.vue";
import AccountSecurityIcon from "../../components/icon/AccountSecurity.vue";
import ReportUserIcon from "../../components/icon/ReportUser.vue";
import QQLogin from "../../components/icon/QQLogin.vue";

const router = useRouter();
const { openAuthorProfile } = useUserStore();
const userStore = useUserStore();
const user = computed(() => userStore.user);

// 安全等级计算逻辑
const securityScore = computed(() => {
  return Math.floor(securityLevel.value);
});

const securityLevel = computed(() => {
  let level = 20; // 基础分
  if (user.value.phone) level += 25;
  if (hasIndependentPassword.value) level += 20;
  if (user.value.email) level += 15;
  if (hasViewedDeviceManagement.value) level += 10;
  if (hasRecentLoginCheck.value) level += 10;
  return Math.min(level, 100);
});

const securityText = computed(() => {
  if (securityLevel.value >= 90) return "极高安全";
  if (securityLevel.value >= 80) return "非常安全";
  if (securityLevel.value >= 60) return "安全";
  if (securityLevel.value >= 40) return "一般";
  return "较低";
});

const securityStatusType = computed(() => {
  if (securityLevel.value >= 90) return "success";
  if (securityLevel.value >= 80) return "primary";
  if (securityLevel.value >= 60) return "warning";
  return "danger";
});

const scoreColor = computed(() => {
  if (securityLevel.value >= 90) return "#52c41a";
  if (securityLevel.value >= 80) return "#1890ff";
  if (securityLevel.value >= 60) return "#faad14";
  return "#ff4d4f";
});

const progressColor = computed(() => {
  if (securityLevel.value >= 90) return "#52c41a";
  if (securityLevel.value >= 80) return "#1890ff";
  if (securityLevel.value >= 60) return "#faad14";
  return "#ff4d4f";
});

// 安全等级标记
const levelMarks = [
  { threshold: 20, label: "低", icon: "thunderbolt" },
  { threshold: 40, label: "一般", icon: "star" },
  { threshold: 60, label: "安全", icon: "rocket" },
  { threshold: 80, label: "高", icon: "crown" },
  { threshold: 90, label: "极高", icon: "safety" },
];

// 安全建议
const securityTips = computed(() => {
  const tips = [
    { id: 1, text: "绑定手机号码", completed: !!user.value.phone },
    { id: 2, text: "设置独立密码", completed: hasIndependentPassword.value },
    { id: 3, text: "绑定邮箱", completed: !!user.value.email },
    { id: 4, text: "查看登录设备", completed: hasViewedDeviceManagement.value },
    { id: 5, text: "定期检查登录记录", completed: hasRecentLoginCheck.value },
  ];
  return tips;
});

// 安全风险
const securityRisks = computed(() => {
  const risks = [];
  if (!user.value.phone) {
    risks.push({
      id: 1,
      title: "未绑定手机",
      description: "绑定手机可以提高账号安全性，便于找回密码",
      action: "立即绑定",
      handler: handlePhoneBinding,
    });
  }
  if (!hasIndependentPassword.value) {
    risks.push({
      id: 2,
      title: "未设置独立密码",
      description: "设置独立密码可以防止未经授权的访问",
      action: "设置密码",
      handler: handlePasswordRecovery,
    });
  }
  if (!hasRecentLoginCheck.value) {
    risks.push({
      id: 3,
      title: "长时间未检查登录记录",
      description: "定期检查登录记录可以发现异常登录行为",
      action: "查看记录",
      handler: handleDeviceManagement,
    });
  }
  return risks;
});

// 计算属性
const hasIndependentPassword = computed(() => {
  return !!(
    user.value.hasIndependentPassword ||
    user.value.password ||
    (user.value.authMethods && user.value.authMethods.includes("password"))
  );
});

const hasViewedDeviceManagement = computed(() => {
  return !!(
    user.value.hasViewedDeviceManagement ||
    (user.value.securityActions &&
      user.value.securityActions.includes("view_device_management"))
  );
});

const hasRecentLoginCheck = computed(() => {
  if (!user.value.lastLoginCheck) return false;
  const lastCheck = new Date(user.value.lastLoginCheck);
  const now = new Date();
  const diffDays = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
});

const maskedPhone = computed(() => {
  if (!user.value.phone) return "";
  const phone = user.value.phone.toString();
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
});

const maskedEmail = computed(() => {
  if (!user.value.email) return "";
  const email = user.value.email;
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}****@${domain}`;
  } else {
    return `${localPart.slice(0, 2)}****@${domain}`;
  }
});

// 处理方法
const handlePasswordRecovery = () => {
  router.push({ name: "resetpassword" });
};

const handlePhoneBinding = () => {
  if (user.value.phone) {
    ElMessage.info("手机号已绑定,请勿重复操作");
  } else {
    ElMessage.info("手机号未绑定,请根据指引进行绑定");
    router.push("/setting/personals");
  }
};

const handleDeviceManagement = () => {
  router.push({ name: "devicemanagement", params: { uuid: user.value.uuid } });
};

const handleQQEmailBinding = () => {
  if (user.value.email) {
    ElMessage.info("QQ邮箱已绑定,请勿重复操作");
  } else {
    ElMessage.info("QQ邮箱未绑定,请根据指引进行绑定");
  }
};

const handleRiskAction = (risk) => {
  if (risk.handler) {
    risk.handler();
  }
};

const securityFeatures = [
  {
    id: "passwordRecovery",
    icon: FoundpasswordIcon,
    title: "找回密码",
    description: "忘记Deep Sea账号密码? 从这里找回",
    actionText: "找回密码",
    completed: hasIndependentPassword.value,
    handler: handlePasswordRecovery,
  },
  {
    id: "phoneBinding",
    icon: phoneIcon,
    title: "手机号绑定",
    description: computed(() =>
      user.value.phone ? `已绑定: ${maskedPhone.value}` : "未绑定手机号"
    ),
    actionText: user.value.phone ? "查看详情" : "立即绑定",
    completed: !!user.value.phone,
    handler: handlePhoneBinding,
  },
  {
    id: "deviceManagement",
    icon: LogindevicemanageIcon,
    title: "登录设备管理",
    description: "查看和管理已登录的设备",
    actionText: "查看设备",
    completed: hasViewedDeviceManagement.value,
    handler: handleDeviceManagement,
  },
  {
    id: "qqEmail",
    icon: QQLogin,
    title: "QQ邮箱绑定",
    description: computed(() =>
      user.value.email ? `已绑定: ${maskedEmail.value}` : "未绑定QQ邮箱"
    ),
    actionText: user.value.email ? "查看详情" : "立即绑定",
    completed: !!user.value.email,
    handler: handleQQEmailBinding,
  },
];
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

// 设计系统变量
:root {
  --primary-color: #4361ee;
  --primary-light: #eef2ff;
  --success-color: #10b981;
  --warning-color: #4361ee;
  --danger-color: #ef4444;
  --info-color: #3b82f6;
  --light-color: #f8fafc;
  --dark-color: #1e293b;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --border-radius: 16px;
  --border-radius-sm: 8px;
  --border-radius-lg: 24px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(10, 192, 242, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.security-center {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  // background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

// 头部区域
.security-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #3a0ca3 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }

  .user-profile-section {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .avatar-container {
    position: relative;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      transform: scale(1.05);

      .avatar-overlay {
        opacity: 1;
      }
    }

    .user-avatar {
      border: 4px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      box-shadow: var(--shadow-lg);
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: var(--transition);

      .camera-icon {
        font-size: 20px;
        color: white;
      }
    }
  }

  .user-info {
    .user-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .user-description {
      color: var(--color-bg3);
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .desc-icon {
        font-size: 18px;
      }
    }
  }

  .security-score-section {
    .score-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .score-progress {
      :deep(.el-progress-circle__track) {
        stroke: rgba(255, 255, 255, 0.2);
      }
    }

    .score-content {
      text-align: center;
      color: var(--color-bg3);

      .score-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
      }

      .score-label {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 4px;
        font-weight: 500;
      }
    }

    .status-tag {
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 20px;
    }
  }
}

// 主要内容区域
.security-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px;

  .main-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.security-section {
  width: 100%;
}

.security-card {
  border-radius: var(--border-radius);
  border: none;
  background: var(--bgColor1);
  transition: var(--transition);
  color: var(--color-bg3);

  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid var(--gray-200);
    padding: 24px;
    background: transparent;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      font-size: 24px;
      color: var(--primary-color);
    }

    .header-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--dark-color);
    }

    .security-status {
      font-weight: 600;
      border-radius: 12px;
    }

    .risks-count {
      :deep(.el-badge__content) {
        border: 2px solid white;
      }
    }
  }
}

// 安全等级卡片
.level-card {
  .level-content {
    display: grid;
    grid-template-columns: 2fr 1px 1fr;
    gap: 32px;
    align-items: center;
    padding: 8px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 24px;
    }
  }

  .section-divider {
    height: 160px;
    background: var(--gray-200);

    @media (max-width: 768px) {
      height: 1px;
      width: 100%;
    }
  }

  .progress-section {
    .progress-container {
      .level-progress {
        margin-bottom: 24px;
        :deep(.el-progress-bar) {
          border-radius: 8px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        :deep(.el-progress-inner) {
          border-radius: 8px;
          transition: width 0.5s ease-out;
        }
      }

      .level-indicators {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        position: relative;
        padding: 0 8px;

        &::before {
          content: "";
          position: absolute;
          top: 8px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gray-200);
          z-index: 1;
          border-radius: 1px;
        }

        .level-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 2;

          .indicator-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--gray-300);
            border: 3px solid white;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .indicator-text {
            font-size: 12px;
            font-weight: 500;
            color: var(--gray-500);
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s ease;

            .indicator-icon {
              font-size: 14px;
            }
          }

          &.active {
            .indicator-dot {
              background: var(--primary-color);
              transform: scale(1.2);
              box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
            }

            .indicator-text {
              color: var(--primary-color);
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  .tips-section {
    .tips-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      .tips-icon {
        font-size: 20px;
        color: var(--warning-color);
      }

      .tips-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--dark-color);
      }
    }

    .tips-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tip-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: var(--border-radius-sm);
      transition: var(--transition);

      &:hover {
        background: var(--gray-900);
      }

      &.completed {
        .tip-check .check-icon {
          color: var(--success-color);
        }

        .tip-text {
          color: var(--success-color);
          text-decoration: line-through;
        }
      }

      .tip-check {
        .check-icon {
          font-size: 18px;
          color: var(--warning-color);
        }
      }

      .tip-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-600);
      }
    }
  }
}

// 安全功能卡片
.features-card {
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    padding: 24px;
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius);
    background: var(--bgColor1);
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;

    &.completed {
      border-left: 4px solid var(--success-color);
    }

    .feature-icon-container {
      position: relative;
      margin-bottom: 16px;

      .icon-wrapper {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light);
        border-radius: 16px;
        color: var(--primary-color);
        font-size: 28px;
      }
    }

    .feature-content {
      flex: 1;
      margin-bottom: 20px;

      .feature-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--dark-color);
        margin-bottom: 8px;
      }

      .feature-description {
        font-size: 14px;
        color: var(--gray-500);
        line-height: 1.5;
        margin: 0;
      }
    }

    .feature-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--gray-200);

      .action-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .action-icon {
        color: var(--primary-color);
        font-size: 14px;
        transition: var(--transition);
      }
    }
  }
}

// 安全风险卡片
.risks-card {
  .risks-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .risk-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--bgColor1);
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius);
    transition: var(--transition);

    .risk-icon {
      font-size: 24px;
      color: var(--warning-color);
    }

    .risk-content {
      flex: 1;

      .risk-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--dark-color);
        margin-bottom: 4px;
      }

      .risk-description {
        font-size: 14px;
        color: var(--gray-600);
        margin: 0;
      }
    }

    .risk-action {
      font-weight: 600;
      border-radius: 8px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .security-header {
    padding: 30px 0;

    .header-container {
      flex-direction: column;
      gap: 24px;
      text-align: center;
    }

    .user-profile-section {
      flex-direction: column;
      gap: 16px;
    }

    .user-info .user-name {
      font-size: 24px;
    }
  }

  .security-main {
    padding: 0 16px 30px;
  }

  .features-card .features-grid {
    grid-template-columns: 1fr;
  }

  .level-card .level-content {
    grid-template-columns: 1fr;
  }

  .risk-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .security-header {
    padding: 24px 0;

    .header-container {
      padding: 0 16px;
    }
  }

  .security-card :deep(.el-card__header) {
    padding: 20px;
  }

  .feature-item {
    padding: 20px;
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.security-section {
  animation: fadeInUp 0.6s ease-out;
}

.security-section:nth-child(1) {
  animation-delay: 0.1s;
}
.security-section:nth-child(2) {
  animation-delay: 0.2s;
}
.security-section:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
