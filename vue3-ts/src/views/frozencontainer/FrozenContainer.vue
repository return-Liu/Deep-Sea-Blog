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

<style scoped>
.frozen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-ice {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-ice-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
}

.floating-ice-2 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.frozen-content {
  width: 100%;
  max-width: 800px;
  z-index: 2;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.icon-wrapper {
  margin-bottom: 24px;
}

.frost-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fff, #e3f2fd);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.freeze-icon {
  font-size: 32px;
  color: #2196f3;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.main-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.card-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f4f8;
}

.section-icon {
  font-size: 20px;
  color: #2196f3;
  margin-right: 12px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.username {
  color: #2196f3;
}

.reason {
  color: #e74c3c;
  line-height: 1.5;
}

.freeze-type.temporary {
  color: #e6a23c;
  font-weight: 600;
  padding: 4px 12px;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 6px;
  display: inline-block;
}

.freeze-type.permanent {
  color: #e74c3c;
  font-weight: 600;
  padding: 4px 12px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 6px;
  display: inline-block;
}

/* 状态卡片样式 */
.status-card {
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.permanent-status {
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  border: 1px solid #fed7d7;
}

.temporary-status {
  background: linear-gradient(135deg, #fffbf0, #fdf6ec);
  border: 1px solid #fdf6ec;
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.status-icon {
  font-size: 24px;
  margin-right: 12px;
}

.permanent-status .status-icon {
  color: #e53e3e;
}

.temporary-status .status-icon {
  color: #e6a23c;
}

.status-title h4 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 18px;
}

.status-title p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

.status-badge {
  margin-left: auto;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.permanent {
  background: #e53e3e;
  color: white;
}

.status-badge.temporary {
  background: #e6a23c;
  color: white;
}

.status-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2d3748;
}

.permanent-status .feature-item .el-icon {
  color: #e53e3e;
  font-size: 16px;
}

.temporary-status .feature-item .el-icon {
  color: #e6a23c;
  font-size: 16px;
}

/* 倒计时区域 */
.countdown-section {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.countdown-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.countdown-item:last-child {
  margin-bottom: 0;
}

.countdown-label {
  color: #718096;
  font-size: 14px;
}

.countdown-value {
  color: #2d3748;
  font-weight: 500;
}

.countdown-text {
  color: #38a169;
  font-weight: 600;
}

.temporary-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(230, 162, 60, 0.1);
  border-radius: 6px;
  color: #e6a23c;
  font-size: 14px;
  margin-top: 16px;
}

.notice-card {
  background: #e8f4fd;
  border: 1px solid #bee3f8;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
}

.notice-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.notice-header .el-icon {
  color: #3182ce;
  margin-right: 8px;
}

.notice-header h4 {
  margin: 0;
  color: #2c5282;
  font-size: 16px;
}

.notice-content {
  color: #2c5282;
  line-height: 1.6;
}

.appeal-steps {
  display: flex;
  gap: 24px;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 16px;
}

.step-content h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.step-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.5;
}

.contact-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f4f8;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  font-size: 14px;
}

.contact-item .el-icon {
  color: #2196f3;
}

.action-section {
  text-align: center;
  margin-top: 40px;
}

.contact-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  margin-right: 12px;
}

.refresh-btn {
  background: #38a169;
  border: none;
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.help-text {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .appeal-steps {
    flex-direction: column;
  }

  .main-card {
    padding: 24px;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .contact-btn,
  .refresh-btn {
    margin-right: 0;
    width: 100%;
  }
}
</style>
