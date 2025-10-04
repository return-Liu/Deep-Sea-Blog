<template>
  <div class="frozen-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-ice floating-ice-1"></div>
      <div class="floating-ice floating-ice-2"></div>
    </div>

    <div class="frozen-content">
      <!-- 头部区域 -->
      <div class="header-section">
        <div class="icon-wrapper">
          <div class="frost-circle">
            <el-icon class="freeze-icon"><Lock /></el-icon>
          </div>
        </div>
        <h1 class="main-title">账户已被冻结</h1>
        <p class="subtitle">您的账户因违反平台规定已被限制使用</p>
      </div>

      <!-- 主要内容 -->
      <div class="main-card">
        <!-- 账户信息 -->
        <div class="card-section">
          <div class="section-header">
            <el-icon class="section-icon"><User /></el-icon>
            <h3>账户信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">账号</span>
              <span class="info-value username">{{
                freezeInfo.username || freezeInfo.email || "未知用户"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">冻结时间</span>
              <span class="info-value time">{{
                formatFreezeTime(freezeInfo.frozenAt)
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">冻结原因</span>
              <span class="info-value reason">{{
                freezeInfo.frozenReason || freezeInfo.reason || "违反平台规定"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">冻结类型</span>
              <span
                class="info-value freeze-type"
                :class="freezeInfo.freezeType"
              >
                {{ getFreezeTypeText(freezeInfo.freezeType) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 冻结状态 - 根据类型显示不同内容 -->
        <div class="status-card" :class="freezeInfo.freezeType + '-status'">
          <div class="status-header">
            <el-icon class="status-icon">
              <Warning v-if="freezeInfo.freezeType === 'permanent'" />
              <Clock v-else />
            </el-icon>
            <div class="status-title">
              <h4>{{ getStatusTitle() }}</h4>
              <p>{{ getStatusSubtitle() }}</p>
            </div>
            <div class="status-badge" :class="freezeInfo.freezeType">
              {{ getFreezeTypeText(freezeInfo.freezeType) }}
            </div>
          </div>
          <div class="status-features">
            <div
              class="feature-item"
              v-for="feature in getStatusFeatures()"
              :key="feature"
            >
              <el-icon><CircleClose /></el-icon>
              <span>{{ feature }}</span>
            </div>
          </div>

          <!-- 临时冻结的倒计时 -->
          <div
            class="countdown-section"
            v-if="
              freezeInfo.freezeType === 'temporary' && freezeInfo.unfreezeAt
            "
          >
            <div class="countdown-item">
              <span class="countdown-label">预计解冻时间:</span>
              <span class="countdown-value">{{
                formatFreezeTime(freezeInfo.unfreezeAt)
              }}</span>
            </div>
            <div class="countdown-item">
              <span class="countdown-label">剩余时间:</span>
              <span class="countdown-value countdown-text">{{
                countdownText
              }}</span>
            </div>
          </div>

          <!-- 临时冻结但没有解冻时间的情况 -->
          <div
            class="temporary-notice"
            v-if="
              freezeInfo.freezeType === 'temporary' && !freezeInfo.unfreezeAt
            "
          >
            <el-icon><InfoFilled /></el-icon>
            <span>此账户为临时冻结，具体解冻时间请等待管理员通知</span>
          </div>
        </div>

        <!-- 冻结说明 -->
        <div class="notice-card" v-if="freezeInfo.frozenMessage">
          <div class="notice-header">
            <el-icon><InfoFilled /></el-icon>
            <h4>冻结说明</h4>
          </div>
          <div class="notice-content">
            <p>{{ freezeInfo.frozenMessage }}</p>
          </div>
        </div>

        <!-- 申诉指引 -->
        <div class="appeal-section">
          <div class="section-header">
            <el-icon class="section-icon"><QuestionFilled /></el-icon>
            <h3>申诉指引</h3>
          </div>
          <div class="appeal-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h5>了解冻结原因</h5>
                <p>仔细阅读冻结详情，了解违规具体情况</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h5>联系客服申诉</h5>
                <p>如您认为冻结有误，可联系客服进行申诉</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h5>提供相关证据</h5>
                <p>准备相关证明材料，配合客服进行调查核实</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 客服信息 -->
        <div class="contact-section">
          <div class="contact-info">
            <div class="contact-item">
              <el-icon><User /></el-icon>
              <span>在线客服：工作日 9:00-18:00</span>
            </div>
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <span>客服邮箱：3829626016@qq.com</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button
          type="primary"
          class="contact-btn"
          @click="contactSupport"
          :icon="ChatDotRound"
        >
          立即联系客服
        </el-button>
        <el-button
          class="refresh-btn"
          @click="refreshStatus"
          v-if="freezeInfo.freezeType === 'temporary'"
          :icon="Refresh"
        >
          刷新状态
        </el-button>
        <p class="help-text">{{ getHelpText() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Lock,
  User,
  Warning,
  InfoFilled,
  QuestionFilled,
  ChatDotRound,
  CircleClose,
  Message,
  Clock,
  Refresh,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  freezeInfo: {
    type: Object,
    required: true,
  },
});

const countdownText = ref("");
const countdownTimer = ref(null);

// 格式化时间显示
const formatFreezeTime = (timeString) => {
  if (!timeString) return "未知时间";
  try {
    const date = new Date(timeString);
    return date.toLocaleString("zh-CN");
  } catch {
    return "时间格式错误";
  }
};

// 获取冻结类型文本
const getFreezeTypeText = (freezeType) => {
  const typeMap = {
    temporary: "临时冻结",
    permanent: "永久冻结",
  };
  return typeMap[freezeType] || "未知类型";
};

// 获取状态标题
const getStatusTitle = () => {
  if (props.freezeInfo.freezeType === "permanent") {
    return "永久冻结状态";
  } else {
    return "临时冻结状态";
  }
};

// 获取状态副标题
const getStatusSubtitle = () => {
  if (props.freezeInfo.freezeType === "permanent") {
    return "此账户已被永久限制";
  } else {
    return "此账户已被临时限制";
  }
};

// 获取状态特征
const getStatusFeatures = () => {
  const commonFeatures = [
    "无法登录和使用平台功能",
    "所有数据将被保留但无法访问",
  ];

  if (props.freezeInfo.freezeType === "permanent") {
    return [...commonFeatures, "账户将无法恢复使用"];
  } else {
    return commonFeatures;
  }
};

// 倒计时更新
const updateCountdown = () => {
  if (
    !props.freezeInfo.unfreezeAt ||
    props.freezeInfo.freezeType !== "temporary"
  ) {
    countdownText.value = "等待解冻中...";
    return;
  }

  const now = new Date().getTime();
  const unfreezeTime = new Date(props.freezeInfo.unfreezeAt).getTime();
  const diff = unfreezeTime - now;

  if (diff <= 0) {
    countdownText.value = "已解冻，请重新登录";
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownText.value = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
};

// 获取帮助文本
const getHelpText = () => {
  if (props.freezeInfo.freezeType === "permanent") {
    return "永久冻结账户需要联系客服进行申诉解冻";
  } else if (props.freezeInfo.unfreezeAt) {
    return `账户将在 ${formatFreezeTime(props.freezeInfo.unfreezeAt)} 自动解冻`;
  } else {
    return "临时冻结账户请等待管理员处理或联系客服";
  }
};

// 联系客服
const contactSupport = () => {
  ElMessage.success(
    "你可以通过邮件联系客服进行申诉解冻,由于客服系统尚未完善,请使用邮箱联系客服进行申诉解冻"
  );
};

// 刷新状态
const refreshStatus = () => {
  if (props.freezeInfo.freezeType === "temporary") {
    updateCountdown();
    ElMessage.info("状态已刷新");
  }
};

// 启动倒计时
onMounted(() => {
  if (props.freezeInfo.freezeType === "temporary") {
    countdownTimer.value = setInterval(updateCountdown, 1000);
    updateCountdown();
  }
});

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});
</script>

<style lang="less" scoped>
@import "../../base-ui/frozencontainer.less";
</style>
