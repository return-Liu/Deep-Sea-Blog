<template>
  <div class="security-center">
    <!-- 安全中心头部 -->
    <header class="security-header">
      <div class="header-content">
        <div class="header-info">
          <div class="header-icon" @click="openAuthorProfile">
            <el-avatar
              v-if="user?.avatar"
              :size="70"
              :src="user.avatar"
              :alt="`用户${user?.nickname || '默认用户'}的头像`"
            />
            <el-avatar v-else :size="70" class="avatar-placeholder">
              {{ user?.nickname?.charAt(0) || "U" }}
            </el-avatar>
          </div>
          <div class="header-text">
            <h1 :style="{ color: user?.nicknameColor || '#fff' }">
              <a-icon type="user" class="title-icon" />
              {{ user?.nickname }}
            </h1>
            <p class="description">
              <a-icon type="safety-certificate" />
              立即提升账号安全等级，快速掌握安全设置
            </p>
          </div>
        </div>
        <div class="security-score">
          <div class="score-circle">
            <el-progress
              type="circle"
              :percentage="securityScore"
              :width="100"
              :stroke-width="8"
              :color="scoreColor"
            >
              <template #default>
                <div class="score-content">
                  <div class="score-value">{{ securityScore }}</div>
                  <div class="score-label">安全评分</div>
                </div>
              </template>
            </el-progress>
          </div>
        </div>
      </div>
    </header>

    <!-- 安全中心主要内容 -->
    <main class="security-main">
      <div class="container">
        <!-- 账号安全等级 -->
        <el-card class="security-level" shadow="hover">
          <template #header>
            <div class="section-header">
              <a-icon type="safety" class="section-icon" />
              <span class="section-title">账号安全等级</span>
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
            <div class="level-progress-section">
              <div class="level-indicator">
                <el-progress
                  :percentage="securityLevel"
                  :stroke-width="12"
                  :color="progressColor"
                  :show-text="false"
                />
                <div class="level-marks">
                  <span
                    v-for="(mark, index) in levelMarks"
                    :key="index"
                    class="level-mark"
                    :class="{ active: securityLevel >= mark.threshold }"
                  >
                    <a-icon :type="mark.icon" />
                    {{ mark.label }}
                  </span>
                </div>
              </div>
            </div>

            <el-divider direction="vertical" class="divider" />

            <div class="level-tips">
              <div class="tip-header">
                <a-icon type="bulb" class="tip-icon" />
                <span>安全建议</span>
              </div>
              <ul class="tip-list">
                <li v-for="tip in securityTips" :key="tip.id" class="tip-item">
                  <el-tag
                    :type="tip.completed ? 'success' : 'warning'"
                    size="small"
                    class="tip-check"
                  >
                    <a-icon
                      :type="
                        tip.completed ? 'check-circle' : 'exclamation-circle'
                      "
                    />
                  </el-tag>
                  <span class="tip-text">{{ tip.text }}</span>
                </li>
              </ul>
            </div>
          </div>
        </el-card>

        <!-- 安全功能模块 -->
        <el-card class="security-features" shadow="hover">
          <template #header>
            <div class="section-header">
              <a-icon type="lock" class="section-icon" />
              <span class="section-title">安全功能</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col
              v-for="feature in securityFeatures"
              :key="feature.id"
              :xs="24"
              :sm="12"
              :lg="8"
            >
              <div
                class="feature-card"
                :class="{ completed: feature.completed }"
                @click="feature.handler"
              >
                <div class="feature-header">
                  <div class="feature-icon-wrapper">
                    <component :is="feature.icon" class="feature-icon" />
                  </div>
                  <div class="feature-info">
                    <h3 class="feature-title">{{ feature.title }}</h3>
                    <el-tag
                      :type="feature.completed ? 'success' : 'warning'"
                      size="small"
                      class="feature-status"
                    >
                      {{ feature.completed ? "已设置" : "未设置" }}
                    </el-tag>
                  </div>
                </div>

                <div class="feature-content">
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
                  <a-icon type="right" class="icon-arrow-right" />
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 安全风险提示 -->
        <el-card
          v-if="securityRisks.length > 0"
          class="security-risks"
          shadow="hover"
        >
          <template #header>
            <div class="section-header">
              <a-icon type="warning" class="section-icon" />
              <span class="section-title">安全风险提示</span>
            </div>
          </template>

          <el-alert
            v-for="risk in securityRisks"
            :key="risk.id"
            :title="risk.title"
            :description="risk.description"
            type="warning"
            :closable="false"
            show-icon
            class="risk-alert"
          >
            <template #action>
              <el-button
                type="warning"
                size="small"
                @click="handleRiskAction(risk)"
              >
                {{ risk.action }}
              </el-button>
            </template>
          </el-alert>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
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
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap");

// 颜色变量
$primary-color: #4361ee;
$primary-light: #eef2ff;
$success-color: #52c41a;
$warning-color: #faad14;
$danger-color: #ff4d4f;
$light-color: #f8f9fa;
$dark-color: #212529;
$gray-color: #6c757d;
$gray-light: #e9ecef;
$border-radius: 12px;
$box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
$transition: all 0.3s ease;

.security-center {
  font-family: "Noto Sans SC", sans-serif;
  min-height: 100vh;
  color: $dark-color;
  background-color: #f5f7fa;
}

.security-header {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  padding: 30px 0;
  margin-bottom: 30px;
  box-shadow: $box-shadow;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-info {
    display: flex;
    align-items: center;
  }

  .header-icon {
    margin-right: 20px;
    cursor: pointer;

    :deep(.el-avatar) {
      border: 3px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
    }
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;

    .title-icon {
      margin-right: 8px;
      font-size: 24px;
    }
  }

  .description {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;

    .anticon {
      margin-right: 6px;
    }
  }

  .security-score {
    .score-circle {
      :deep(.el-progress-circle) {
        .el-progress-circle__track {
          stroke: rgba(255, 255, 255, 0.2);
        }
      }

      .score-content {
        text-align: center;
        color: white;

        .score-value {
          font-size: 24px;
          font-weight: bold;
          line-height: 1;
        }

        .score-label {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 4px;
        }
      }
    }
  }
}

.security-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 30px;

  .container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

:deep(.el-card) {
  border-radius: $border-radius;
  border: none;

  .el-card__header {
    border-bottom: 1px solid $gray-light;
    padding: 20px 24px;
    background: transparent;
  }
}

.section-header {
  display: flex;
  align-items: center;

  .section-icon {
    font-size: 20px;
    margin-right: 12px;
    color: $primary-color;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: $dark-color;
    flex: 1;
  }
}

.security-level {
  .level-content {
    display: flex;
    gap: 30px;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .level-progress-section {
    flex: 2;

    .level-indicator {
      .level-marks {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;

        .level-mark {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: $gray-color;
          transition: $transition;

          .anticon {
            font-size: 16px;
            margin-bottom: 4px;
          }

          &.active {
            color: $primary-color;
            font-weight: 500;

            .anticon {
              color: inherit;
            }
          }
        }
      }
    }
  }

  .divider {
    height: 120px;

    @media (max-width: 768px) {
      height: auto;
      width: 100%;
    }
  }

  .level-tips {
    flex: 1;
    min-width: 200px;

    .tip-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-weight: 500;
      color: $dark-color;

      .tip-icon {
        margin-right: 8px;
        color: $warning-color;
      }
    }

    .tip-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .tip-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 0;

        .tip-check {
          margin-right: 12px;
          border: none;

          .anticon {
            font-size: 14px;
          }
        }

        .tip-text {
          font-size: 14px;
          color: $dark-color;
        }
      }
    }
  }
}

.security-features {
  :deep(.el-row) {
    margin: -10px;
  }

  :deep(.el-col) {
    padding: 10px;
  }
}

.feature-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  border-radius: $border-radius;
  background: white;
  cursor: pointer;
  transition: $transition;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $box-shadow;
    border-color: $primary-color;

    .feature-action .icon-arrow-right {
      transform: translateX(3px);
    }
  }

  &.completed {
    border-left: 4px solid $success-color;
  }

  .feature-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .feature-icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    background: $primary-light;
    border-radius: 10px;
    color: $primary-color;
    font-size: 24px;
  }

  .feature-info {
    flex: 1;

    .feature-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: $dark-color;
    }

    .feature-status {
      border: none;
      font-weight: 500;
    }
  }

  .feature-content {
    margin-bottom: 15px;
    flex: 1;

    .feature-description {
      font-size: 14px;
      color: $gray-color;
      margin: 0;
      line-height: 1.5;
    }
  }

  .feature-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 15px;
    border-top: 1px solid $gray-light;

    .action-text {
      font-size: 14px;
      color: $primary-color;
      font-weight: 500;
    }

    .icon-arrow-right {
      color: $primary-color;
      transition: $transition;
      font-size: 12px;
    }
  }
}

.security-risks {
  .risk-alert {
    margin-bottom: 15px;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.el-alert__title) {
      font-weight: 600;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .security-header {
    .header-content {
      flex-direction: column;
      text-align: center;
    }

    .header-info {
      flex-direction: column;
      margin-bottom: 20px;

      .header-icon {
        margin-right: 0;
        margin-bottom: 15px;
      }
    }
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .level-content {
    flex-direction: column;
  }

  .divider {
    display: none;
  }
}
</style>
