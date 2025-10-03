<template>
  <div class="frozen-container">
    <!-- 背景装饰元素 -->
    <div class="decoration">
      <canvas ref="particleCanvas" class="particle-canvas"></canvas>
    </div>

    <div class="frozen-card">
      <!-- 顶部图标区域 -->
      <div class="icon-section">
        <div class="icon-wrapper">
          <el-icon class="frozen-icon"><Lock /></el-icon>
          <div class="ice-ring"></div>
        </div>
        <h1 class="title">账户已被冻结</h1>
        <div class="subtitle">您的账户因违反平台规定已被限制使用</div>
      </div>

      <!-- 信息卡片区域 -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-header">
            <el-icon><User /></el-icon>
            <span>账户信息</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="label">账号:</span>
              <span class="value username">{{
                freezeInfo.username || "未知用户"
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">冻结原因:</span>
              <span class="value reason">{{
                freezeInfo.frozenReason || "违反社区规定"
              }}</span>
            </div>
            <div class="info-item" v-if="freezeInfo.frozenAt">
              <span class="label">冻结时间:</span>
              <span class="value time">{{
                formatFreezeTime(freezeInfo.frozenAt)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">冻结类型:</span>
              <span class="value freeze-type" :class="freezeInfo.freezeType">
                {{ getFreezeTypeText(freezeInfo.freezeType) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 临时冻结信息 -->
        <div
          class="info-card temporary-card"
          v-if="freezeInfo.freezeType === 'temporary'"
        >
          <div class="info-header">
            <el-icon><Clock /></el-icon>
            <span>解冻信息</span>
          </div>
          <div class="info-content">
            <div class="info-item" v-if="freezeInfo.unfreezeAt">
              <span class="label">预计解冻时间:</span>
              <span class="value unfreeze-time">{{
                formatFreezeTime(freezeInfo.unfreezeAt)
              }}</span>
            </div>
            <div class="info-item" v-if="freezeInfo.unfreezeAt">
              <span class="label">剩余时间:</span>
              <span class="value countdown">{{ countdownText }}</span>
            </div>
            <div class="temporary-notice" v-if="!freezeInfo.unfreezeAt">
              <el-icon><InfoFilled /></el-icon>
              <span>此账户为临时冻结，具体解冻时间请等待管理员通知</span>
            </div>
          </div>
        </div>

        <!-- 永久冻结信息 -->
        <div
          class="info-card permanent-card"
          v-else-if="freezeInfo.freezeType === 'permanent'"
        >
          <div class="info-header">
            <el-icon><Warning /></el-icon>
            <span>冻结详情</span>
          </div>
          <div class="info-content">
            <div class="permanent-badge">
              <el-icon><CloseBold /></el-icon>
              <span>永久冻结</span>
            </div>
            <div class="permanent-details">
              <p class="permanent-notice">此账户因严重违规已被永久限制使用</p>
              <div class="permanent-features">
                <div class="feature-item">
                  <el-icon><CircleClose /></el-icon>
                  <span>无法登录和使用平台功能</span>
                </div>
                <div class="feature-item">
                  <el-icon><CircleClose /></el-icon>
                  <span>无法发送消息和发布内容</span>
                </div>
                <div class="feature-item">
                  <el-icon><CircleClose /></el-icon>
                  <span>所有数据将被保留但无法访问</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 冻结说明 -->
        <div class="notice-card" v-if="freezeInfo.frozenMessage">
          <div class="notice-header">
            <el-icon><InfoFilled /></el-icon>
            <span>冻结说明</span>
          </div>
          <p class="notice-content">{{ freezeInfo.frozenMessage }}</p>
        </div>

        <!-- 申诉指引 -->
        <div class="appeal-card">
          <div class="appeal-header">
            <el-icon><QuestionFilled /></el-icon>
            <span>申诉指引</span>
          </div>
          <div class="appeal-content">
            <div class="appeal-steps">
              <div
                class="step-item"
                v-if="freezeInfo.freezeType === 'temporary'"
              >
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>等待自动解冻</h4>
                  <p v-if="freezeInfo.unfreezeAt">
                    系统将在
                    {{ formatFreezeTime(freezeInfo.unfreezeAt) }}
                    自动解冻您的账户
                  </p>
                  <p v-else>请耐心等待管理员处理</p>
                </div>
              </div>
              <div class="step-item" v-else>
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>了解冻结原因</h4>
                  <p>仔细阅读冻结原因，了解违规具体情况</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>联系客服申诉</h4>
                  <p>如果您认为冻结有误，可联系客服进行申诉</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>提供相关证据</h4>
                  <p>准备相关证明材料，配合客服进行调查</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-section">
        <div class="action-buttons">
          <el-button type="primary" class="contact-btn" @click="contactSupport">
            <el-icon><ChatDotRound /></el-icon>
            联系客服申诉
          </el-button>
          <el-button class="logout-btn" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
          <el-button
            class="refresh-btn"
            @click="refreshStatus"
            v-if="freezeInfo.freezeType === 'temporary'"
          >
            <el-icon><Refresh /></el-icon>
            刷新状态
          </el-button>
        </div>
        <div class="help-text">
          {{ getHelpText() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  Lock,
  User,
  Clock,
  Warning,
  InfoFilled,
  ChatDotRound,
  SwitchButton,
  Refresh,
  CloseBold,
  CircleClose,
  QuestionFilled,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import axiosConfig from "../../utils/request";

const router = useRouter();
const countdownText = ref("");
const countdownTimer = ref(null);
const particleCanvas = ref(null);
const animationId = ref(null);

const freezeInfo = ref({
  frozenReason: "",
  frozenAt: "",
  unfreezeAt: "",
  freezeType: "temporary",
  username: "",
  frozenMessage: "",
});

// 粒子系统类
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.particleCount = 100;

    this.resize();
    this.initParticles();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.5 + 0.1,
        color: `rgba(64, 158, 255, ${Math.random() * 0.5 + 0.2})`,
      });
    }
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;

      if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
        p.x = Math.random() * this.width;
        p.y = Math.random() * this.height;
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 0.1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = "rgba(64, 158, 255, 0.3)";
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
  }

  animate() {
    this.update();
    this.draw();
  }
}

let particleSystem = null;

// 格式化时间显示
const formatFreezeTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  return date.toLocaleString("zh-CN");
};

// 修改倒计时结束逻辑
const updateCountdown = () => {
  if (
    !freezeInfo.value.unfreezeAt ||
    freezeInfo.value.freezeType !== "temporary"
  ) {
    countdownText.value = "等待解冻中...";
    return;
  }

  const now = new Date().getTime();
  const unfreezeTime = new Date(freezeInfo.value.unfreezeAt).getTime();
  const diff = unfreezeTime - now;

  if (diff <= 0) {
    countdownText.value = "已解冻，请重新登录";
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }

    // 检查后端状态
    setTimeout(() => {
      updateUserStatus();
    }, 2000);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownText.value = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
};

// 获取冻结类型文本
const getFreezeTypeText = (freezeType) => {
  const typeMap = {
    temporary: "临时冻结",
    permanent: "永久冻结",
  };
  return typeMap[freezeType] || "未知类型";
};

// 获取帮助文本
const getHelpText = () => {
  if (freezeInfo.value.freezeType === "permanent") {
    return "永久冻结账户需要联系客服进行申诉解冻";
  } else if (freezeInfo.value.unfreezeAt) {
    return `账户将在 ${formatFreezeTime(freezeInfo.value.unfreezeAt)} 自动解冻`;
  } else {
    return "临时冻结账户请等待管理员处理或联系客服";
  }
};

// 联系客服
const contactSupport = () => {
  const message =
    freezeInfo.value.freezeType === "permanent"
      ? "永久冻结账户申诉，请提供您的账号信息和相关证明材料"
      : "临时冻结申诉，请提供您的账号信息和申诉理由";

  ElMessage.info(`联系客服: ${message}`);
  // 这里可以跳转到客服页面或打开客服对话框
};

// 刷新状态
const refreshStatus = () => {
  if (freezeInfo.value.freezeType === "temporary") {
    updateCountdown();
    ElMessage.info("状态已刷新");
  }
};

// 退出登录
const logout = () => {
  Cookies.remove("ds-token");
  router.push("/login/index");
};

// 粒子动画循环
const animateParticles = () => {
  if (particleSystem) {
    particleSystem.animate();
  }
  animationId.value = requestAnimationFrame(animateParticles);
};

// 检查用户是否真的被冻结
const checkUserFrozenStatus = async () => {
  try {
    const token = Cookies.get("ds-token");
    if (!token) {
      // 没有token，重定向到登录页
      router.push("/login/index");
      return false;
    }

    // 获取用户当前状态
    const response = await axiosConfig.get("/auth/currentuser");
    const user = response.data.data;

    if (!user.isFrozen) {
      // 用户未被冻结，显示提示并重定向
      ElMessageBox.alert("您的账户未被冻结，即将返回主页", "提示", {
        confirmButtonText: "确定",
        type: "success",
        callback: () => {
          router.push("/layout");
        },
      });
      return false;
    }

    // 用户确实被冻结，更新冻结信息
    freezeInfo.value = {
      username: user.username || "",
      frozenReason: user.frozenReason || "违反社区规定",
      frozenAt: user.frozenAt || new Date().toISOString(),
      unfreezeAt: user.unfreezeAt || "",
      freezeType: user.freezeType || "temporary",
      frozenMessage:
        user.frozenMessage ||
        "您的账户因违反平台规定已被冻结，如有疑问请联系客服。",
    };

    return true;
  } catch (error) {
    console.error("检查用户冻结状态失败:", error);
    ElMessage.error("获取用户状态失败，请重新登录");
    Cookies.remove("ds-token");
    router.push("/login/index");
    return false;
  }
};

onMounted(async () => {
  // 首先检查用户是否真的被冻结
  const isUserFrozen = await checkUserFrozenStatus();
  if (!isUserFrozen) {
    return; // 如果用户未被冻结，不继续执行
  }

  // 启动倒计时
  if (freezeInfo.value.freezeType === "temporary") {
    countdownTimer.value = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  // 初始化粒子系统
  if (particleCanvas.value) {
    particleSystem = new ParticleSystem(particleCanvas.value);
    animateParticles();
  }
});

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>
<style scoped>
.frozen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle-canvas {
  width: 100%;
  height: 100%;
}

.frozen-card {
  width: 100%;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.icon-section {
  padding: 40px 30px 20px;
  text-align: center;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7)
  );
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.frozen-icon {
  font-size: 60px;
  color: #409eff;
  z-index: 2;
  position: relative;
}

.ice-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 80px;
  height: 80px;
  border: 3px solid rgba(64, 158, 255, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.title {
  color: #303133;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  color: #606266;
  font-size: 16px;
}

.info-section {
  padding: 30px;
}

.info-card,
.notice-card,
.appeal-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.info-header,
.notice-header,
.appeal-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
}

.info-header .el-icon,
.notice-header .el-icon,
.appeal-header .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.info-content {
  padding: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  width: 120px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
}

.username {
  color: #409eff;
  font-weight: 500;
}

.reason {
  color: #f56c6c;
  font-weight: 500;
}

.freeze-type.temporary {
  color: #e6a23c;
  font-weight: 600;
}

.freeze-type.permanent {
  color: #f56c6c;
  font-weight: 600;
}

.countdown {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

/* 临时冻结卡片样式 */
.temporary-card {
  border-left: 4px solid #e6a23c;
}

.temporary-notice {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fdf6ec;
  border-radius: 6px;
  color: #e6a23c;
  font-size: 14px;
}

.temporary-notice .el-icon {
  margin-right: 8px;
}

/* 永久冻结卡片样式 */
.permanent-card {
  border-left: 4px solid #f56c6c;
}

.permanent-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f56c6c;
  color: white;
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  gap: 8px;
}

.permanent-details {
  text-align: center;
}

.permanent-notice {
  color: #f56c6c;
  margin-bottom: 16px;
  font-weight: 500;
}

.permanent-features {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.feature-item .el-icon {
  margin-right: 8px;
  color: #f56c6c;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.notice-card {
  border-left: 4px solid #409eff;
}

.notice-content {
  padding: 20px;
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

/* 申诉指引卡片 */
.appeal-card {
  border-left: 4px solid #67c23a;
}

.appeal-content {
  padding: 20px;
}

.appeal-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #67c23a;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 14px;
}

.step-content p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

/* 操作区域 */
.action-section {
  padding: 20px 30px 30px;
  text-align: center;
  background: rgba(248, 249, 250, 0.7);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.contact-btn,
.logout-btn,
.refresh-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-btn {
  background: linear-gradient(to right, #409eff, #66b1ff);
  border: none;
}

.logout-btn {
  border-color: #dcdfe6;
}

.refresh-btn {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
}

.help-text {
  color: #909399;
  font-size: 14px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .frozen-card {
    max-width: 100%;
    margin: 0 15px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .label {
    width: 100%;
    margin-bottom: 5px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .contact-btn,
  .logout-btn,
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .step-number {
    align-self: center;
  }
}
</style>
