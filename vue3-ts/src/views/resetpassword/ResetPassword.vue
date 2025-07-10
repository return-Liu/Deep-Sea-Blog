<template>
  <div class="forget-password-container">
    <div class="forget-password-card">
      <h1 class="forget-password-title">
        当前仅支持邮箱验证，手机号验证功能即将上线。
      </h1>
      <!-- 步骤提示 -->
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="确认账号"></el-step>
        <el-step title="重置密码"></el-step>
        <el-step title="重置成功"></el-step>
      </el-steps>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit">
        <!-- 第一步：确认账号 -->
        <div v-if="currentStep === 1" class="form-group">
          <el-input v-model="email" placeholder="请输入绑定的邮箱" clearable />
          <button
            @keydown.enter="nextStep"
            type="button"
            @click="nextStep"
            class="next-btn"
          >
            下一步
          </button>
        </div>

        <!-- 第二步：重置密码 -->
        <div v-if="currentStep === 2" class="form-group">
          <el-input v-model="email" disabled placeholder="已验证邮箱" />

          <el-input
            v-model="newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入新密码"
            show-password
          />
          <el-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="请确认新密码"
            show-password
          />

          <div class="verification-code-wrapper">
            <el-input v-model="verificationCode" placeholder="请输入验证码" />
            <span
              type="button"
              :disabled="isSendingCode"
              @click="sendVerificationCode"
              :style="
                isSendingCode ? 'pointer-events: none; opacity: 0.6;' : ''
              "
              :class="{ disabled: isSendingCode }"
              class="send-code-btn"
            >
              {{ isSendingCode ? `重新发送(${countdown}s)` : "发送验证码" }}
            </span>
          </div>

          <button type="submit" class="next-btn">提交</button>
        </div>

        <!-- 第三步：重置成功 -->
        <div v-if="currentStep === 3" class="form-group">
          <p class="success-message">密码重置成功！</p>
          <button type="button" @click="goLogin" class="next-btn">
            返回登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axiosConfig from "../../utils/request";
import { ElMessage } from "element-plus";
import { ElSteps, ElStep } from "element-plus"; // 引入 Element Plus 的步骤条组件
import { debounce } from "../../utils/debounce";
const router = useRouter();

// 数据绑定
const email = ref("");
const verificationCode = ref(""); // 新增验证码字段
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 当前步骤
const currentStep = ref(1);

// 验证码相关状态
const isSendingCode = ref(false);
const countdown = ref(60);

// 验证函数
const validateEmail = () => {
  if (!email.value) {
    ElMessage.error("邮箱不能为空");
    return false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value)) {
    ElMessage.error("邮箱格式不正确");
    return false;
  }
  return true;
};

const validateVerificationCode = () => {
  if (!verificationCode.value) {
    ElMessage.error("验证码不能为空");
    return false;
  }
  return true;
};

const validateNewPassword = () => {
  if (!newPassword.value) {
    ElMessage.error("新密码不能为空");
    return false;
  }
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongRegex.test(newPassword.value)) {
    ElMessage.error("需包含大小写字母、数字和特殊字符，至少8位");
    return false;
  }
  return true;
};

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    ElMessage.error("确认密码不能为空");
    return false;
  }
  if (confirmPassword.value !== newPassword.value) {
    ElMessage.error("两次输入的密码不一致");
    return false;
  }
  return true;
};

// 启动倒计时
const startCountdown = () => {
  isSendingCode.value = true;
  countdown.value = 60;
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      isSendingCode.value = false; // 恢复为可点击状态
    }
  }, 1000);
};
// 发送验证码
const sendVerificationCode = async () => {
  if (!validateEmail()) return;
  try {
    isSendingCode.value = true; // 发送前立即禁用按钮

    const response = await axiosConfig.post("/email/getemail", {
      email: email.value,
    });

    startCountdown(); // 启动倒计时
    ElMessage.success(response.data.message);
  } catch (error: any) {
    isSendingCode.value = false; // 请求失败，恢复按钮状态
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
// 下一步
const nextStep = async () => {
  if (currentStep.value === 1) {
    if (!validateEmail()) return;
    currentStep.value = 2;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (
    !validateEmail() ||
    !validateVerificationCode() ||
    !validateNewPassword() ||
    !validateConfirmPassword()
  )
    return;

  try {
    const response = await axiosConfig.post("/email/resetpassword", {
      email: email.value,
      code: verificationCode.value,
      password: newPassword.value,
    });
    ElMessage.success(response.data.message);
    currentStep.value = 3;
  } catch (error: any) {
    const errorMessage = error?.errors?.[0] || "未知错误";
    ElMessage.error(errorMessage);
    return false;
  }
};

// 返回登录
const goLogin = () => {
  router.push("/login");
};
</script>

<style scoped lang="less">
@import "../../base-ui/resetpass.less";
/* 调整步骤条样式 */
.custom-steps {
  width: 100%; /* 设置步骤条的宽度为100% */
  margin-bottom: 20px;
}

/* 调整表单样式 */
.custom-form {
  width: 100%; /* 设置表单的宽度为100% */
  padding: 0 20px; /* 添加内边距以防止内容紧贴边缘 */
}

/* 调整输入框宽度 */
.custom-input {
  width: 100%; /* 设置输入框的宽度为100% */
  margin-bottom: 15px; /* 添加底部间距 */
}

.form-group {
  text-align: center;
}

.next-btn {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  width: 100%; /* 设置按钮宽度为100% */
}

.send-code-btn {
  margin-left: 10px;
  color: #409eff;
  cursor: pointer;
}

.success-message {
  font-size: 18px;
  color: #67c23a;
  margin-bottom: 20px;
}
.send-code-btn.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
