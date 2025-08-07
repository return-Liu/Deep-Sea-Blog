<template>
  <div class="login-modal-mask">
    <div
      class="login-modal"
      :style="{
        backgroundImage: isInputFocused
          ? 'url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/22_close.9382a5a8.png), url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/33_close.a8c18fc8.png)'
          : 'url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/22_open.4ea5f239.png), url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/33_open.f7d7f655.png)',
      }"
    >
      <div class="login-tabs">
        <div
          :class="['tab', activeTab === 'password' && 'active']"
          @click="activeTab = 'password'"
        >
          密码登录
        </div>
        <div
          :class="['tab', activeTab === 'sms' && 'active']"
          @click="activeTab = 'sms'"
        >
          邮箱登录
        </div>
      </div>
      <div class="login-content">
        <transition name="fade-slide" mode="out-in">
          <div v-if="activeTab === 'password'" key="password">
            <el-form @keydown.enter="login" :model="loginForm">
              <el-form-item label="账号">
                <el-input
                  v-model="loginForm.email"
                  placeholder="请输入你的账号/手机号/邮箱"
                />
              </el-form-item>
              <el-form-item label="密码">
                <el-input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="loginForm.password"
                  placeholder="请输入你的密码"
                  @focus="isInputFocused = true"
                  @blur="isInputFocused = false"
                >
                  <template #suffix>
                    <el-icon
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                      style="cursor: pointer; position: absolute; right: 70px"
                    >
                      <View v-if="showPassword" />
                      <Hide v-else />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <div
                class="login-links"
                style="position: absolute; right: 10px; top: 55px"
              >
                <span style="color: skyblue" @click="forgetpassword"
                  >忘记密码?</span
                >
              </div>
            </el-form>
          </div>
          <div v-else-if="activeTab === 'sms'" key="sms">
            <el-form @keydown.enter="login" :model="loginForm">
              <el-form-item label="邮箱">
                <el-input
                  v-model="smsForm.email"
                  placeholder="请输入你的邮箱/手机号"
                />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input
                  v-model="smsForm.code"
                  placeholder="请输入你的邮箱/手机号验证码"
                  @focus="isInputFocused = true"
                  @blur="isInputFocused = false"
                />
                <span
                  :style="
                    isSending ? 'pointer-events: none; opacity: 0.6;' : ''
                  "
                  @click="sendSmsCode"
                  :disabled="isSending"
                  class="send-code-btn"
                >
                  {{ isSending ? `${countdown}秒后重新发送` : "获取验证码" }}
                </span>
              </el-form-item>
            </el-form>
          </div>
        </transition>
      </div>
      <div class="login-footer">
        <el-button
          v-if="activeTab === 'password'"
          type="default"
          @click="registersms"
          class="register-btn"
          >注册</el-button
        >
        <el-button
          v-if="activeTab === 'password'"
          type="primary"
          @click="login"
          class="login-button"
          :loading="loading"
          >登录</el-button
        >
        <el-button
          type="primary"
          @click="login"
          class="login-button"
          :loading="loading"
          v-if="activeTab === 'sms'"
        >
          登录/注册
        </el-button>
      </div>
      <!-- 其他登录方式 -->
      <div class="other-login-options">
        <h2 class="login-methods-title">其他登录方式</h2>
        <div class="login-methods">
          <span>
            <component :is="QQLoginIcon" class="icon" />
            <span @click="openQQLoginDialog" class="text">QQ登录</span>
          </span>
          <span>
            <component :is="WeChatLoginIcon" class="icon" />
            <span @click="openWeChatLoginDialog" class="text">微信登录</span>
          </span>
          <span>
            <component :is="WeBlogIcon" class="icon" />
            <span @click="openWeBlogLoginDialog" class="text">微博登录</span>
          </span>
        </div>
        <div class="login-tip">
          <p>目前支持邮箱验证码登录，手机短信验证功能即将上线，敬请期待！</p>
          <p>未注册过Deep Sea的邮箱/手机号, 我们将自动帮你注册账号</p>
          <p>
            登录或完成注册即代表你同意
            <router-link
              style="color: #00a1d6"
              to="/userprotocol"
              target="_blank"
              >用户协议</router-link
            >
            及
            <router-link style="color: #00a1d6" target="_blank" to="/privacy"
              >隐私政策</router-link
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import debounce from "lodash.debounce";
import axiosConfig from "../../utils/request";
import { View, Hide } from "@element-plus/icons-vue";
import { handlePostLogin } from "../../utils/handlePostLogin";
import { handleLoginError } from "../../utils/handleLoginError";
import QQLoginIcon from "../../components/icon/QQLogin.vue";
import WeChatLoginIcon from "../../components/icon/WeChatLogin.vue";
import WeBlogIcon from "../../components/icon/WeBlog.vue";
import { useI18n } from "vue-i18n";
import Cookies from "js-cookie";
const { locale } = useI18n();
const router = useRouter();
let isInputFocused = ref(false);
let isSending = ref(false);
let countdown = ref(60);
let loading = ref(false);

const accountsclientFeatureCode = Cookies.get("userFeatureCode");
const countdownTimer = ref<number | null>(null);
let activeTab = ref("password");
let loginForm = ref({
  email: "",
  password: "",
});
let smsForm = ref({ email: "", code: "" });
let showPassword = ref(false);
let validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

let validate = () => {
  if (!loginForm.value.email) {
    ElMessage.error("请你的输入账号/邮箱/手机号~");
    return false;
  }
  if (!loginForm.value.password) {
    ElMessage.error("请你的输入密码~");
    return false;
  }
  return true;
};
let validateEmailAndCode = () => {
  if (!smsForm.value.email || !validateEmail(smsForm.value.email)) {
    ElMessage.error("请输入正确的邮箱~");
    return false;
  }
  if (!smsForm.value.code) {
    ElMessage.error("请输入你的邮箱/手机号验证码~");
    return false;
  }
  return true;
};

let registersms = () => {
  activeTab.value = "sms";
};

let forgetpassword = () => {
  router.push("/resetpassword");
};

let login = debounce(async () => {
  if (activeTab.value === "password" && !validate()) return;
  if (activeTab.value === "sms" && !validateEmailAndCode()) return;

  loading.value = true;
  try {
    let response;
    if (activeTab.value === "password") {
      // 密码登录
      response = await axiosConfig.post("/auth/sign_in", {
        login: loginForm.value.email,
        password: loginForm.value.password,
      });
    } else {
      // 邮箱验证码登录
      response = await axiosConfig.post("/auth/email", {
        email: smsForm.value.email,
        code: smsForm.value.code,
        clientFeatureCode: accountsclientFeatureCode,
      });
    }
    // 通用登录后处理
    handlePostLogin(response, locale.value, router);
  } catch (error: any) {
    handleLoginError(error);
  } finally {
    loading.value = false;
  }
}, 1000);
const startCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
  countdownTimer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
      isSending.value = false;
      countdown.value = 60;
    }
  }, 1000);
};
let sendSmsCode = debounce(async () => {
  if (isSending.value) return;

  // 校验邮箱输入
  if (!smsForm.value.email) {
    ElMessage.error("请输入你的邮箱/手机号~");
    return;
  }
  if (!validateEmail(smsForm.value.email)) {
    ElMessage.error("邮箱格式不正确~");
    return;
  }

  // 处理 clientFeatureCode（UUID）
  let clientFeatureCode = accountsclientFeatureCode;
  if (!clientFeatureCode || clientFeatureCode.trim() === "") {
    clientFeatureCode = undefined; // 让后端生成新的 UUID
  }
  isSending.value = true;
  try {
    const response = await axiosConfig.post("/auth/email/verify", {
      email: smsForm.value.email,
      clientFeatureCode: clientFeatureCode,
    });
    ElMessage.success(response.data.message);
    startCountdown(); // 启动倒计时
  } catch (error: any) {
    isSending.value = false;
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);

    // 特定错误提示
    if (errorMessage.includes("UUID 已存在")) {
      ElMessage.warning("UUID 已存在，请稍后再试或清除缓存重试。");
    }
  }
}, 1000); // 防止重复点击
onUnmounted(() => {
  // 销毁定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value!);
  }
});
// QQ 微信 微博 登录方法接口
const openQQLoginDialog = async () => {};
const openWeChatLoginDialog = async () => {};
const openWeBlogLoginDialog = async () => {};
</script>
<style lang="less" scoped>
@import "../../base-ui/login.less";
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.login-sms-title {
  font-size: 10px;
  font-weight: 500;
  margin-top: -20px;
  padding: 5px;
  color: #333;
  text-align: center;
}
.login-methods-title {
  font-size: 14px;
  margin-bottom: 10px;
}
.login-methods {
  display: flex;
  position: relative;
  .icon {
    width: 20px;
    height: 20px;
    position: absolute;
  }
  .text {
    margin-left: 23px;
    font-size: 12px;
    &:hover {
      color: #05d2f7;
    }
  }
}
.send-code-btn {
  position: absolute;
  right: 10px;
  top: 0;
  color: #409eff;
}
</style>
