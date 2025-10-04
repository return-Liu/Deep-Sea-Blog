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
<style lang="less" scoped>
@import "../../base-ui/securitycenter.less";
</style>
