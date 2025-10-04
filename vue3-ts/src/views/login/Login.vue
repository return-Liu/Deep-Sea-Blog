<template>
  <div class="login-wrapper">
    <!-- 登录页面 - 水平居中 -->
    <div v-if="!isFrozen" class="login-center-container">
      <div
        class="login-modal"
        :style="{
          backgroundImage: isInputFocused
            ? 'url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/22_close.9382a5a8.png), url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/33_close.a8c18fc8.png)'
            : 'url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/22_open.4ea5f239.png), url(https://s1.hdslb.com/bfs/seed/jinkela/short/mini-login-v2/img/33_open.f7d7f655.png)',
        }"
      >
        <!-- 登录表单内容 -->
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
            >登录/注册</el-button
          >
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

    <!-- 冻结页面 - 全屏显示 -->
    <FrozenContainer v-if="isFrozen" :freeze-info="freezeInfo" />
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
import FrozenContainer from "../frozencontainer/FrozenContainer.vue";
import { useI18n } from "vue-i18n";
import Cookies from "js-cookie";

const isFrozen = ref(false);
const freezeInfo = ref({
  username: "",
  frozenReason: "",
  frozenAt: "",
  unfreezeAt: "",
  freezeType: "temporary",
  frozenMessage: "",
});

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
      response = await axiosConfig.post("/auth/sign_in", {
        login: loginForm.value.email,
        password: loginForm.value.password,
      });
    } else {
      response = await axiosConfig.post("/auth/email", {
        email: smsForm.value.email,
        code: smsForm.value.code,
        clientFeatureCode: accountsclientFeatureCode,
      });
    }

    // 检查是否被冻结
    if (
      response.data.data &&
      (response.data.data.isFrozen === true ||
        response.data.data.isFrozen === 1 ||
        response.data.data.frozen === true)
    ) {
      ElMessage.error(response.data.data.message || "账户已被冻结");

      const freezeData = response.data.data;
      freezeInfo.value = {
        username:
          freezeData.username || freezeData.email || loginForm.value.email,
        frozenReason:
          freezeData.frozenReason || freezeData.reason || "违反平台规定",
        frozenAt: freezeData.frozenAt || new Date().toISOString(),
        unfreezeAt: freezeData.unfreezeAt || "",
        freezeType: freezeData.freezeType || "temporary",
        frozenMessage:
          freezeData.frozenMessage || "您的账户因违反平台规定已被冻结",
      };
      isFrozen.value = true;

      loading.value = false;
      return;
    }

    // 用户未冻结，正常登录
    handlePostLogin(response, locale.value, router);
  } catch (error: any) {
    // 处理冻结错误
    if (
      error?.response?.data?.code === "USER_FROZEN" ||
      error?.response?.data?.message?.includes("冻结") ||
      error?.response?.data?.data?.isFrozen === true ||
      error?.response?.data?.data?.isFrozen === 1
    ) {
      ElMessage.error("账户已被冻结");
      const freezeData = error.response.data.data || error.response.data || {};
      freezeInfo.value = {
        username:
          freezeData.username || freezeData.email || loginForm.value.email,
        frozenReason:
          freezeData.frozenReason || freezeData.reason || "违反平台规定",
        frozenAt: freezeData.frozenAt || new Date().toISOString(),
        unfreezeAt: freezeData.unfreezeAt || "",
        freezeType: freezeData.freezeType || "temporary",
        frozenMessage:
          freezeData.frozenMessage || "您的账户因违反平台规定已被冻结",
      };
      isFrozen.value = true;
      loading.value = false;
      return;
    }
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

  if (!smsForm.value.email) {
    ElMessage.error("请输入你的邮箱/手机号~");
    return;
  }
  if (!validateEmail(smsForm.value.email)) {
    ElMessage.error("邮箱格式不正确~");
    return;
  }

  let clientFeatureCode = accountsclientFeatureCode;
  if (!clientFeatureCode || clientFeatureCode.trim() === "") {
    clientFeatureCode = undefined;
  }
  isSending.value = true;
  try {
    const response = await axiosConfig.post("/auth/email/verify", {
      email: smsForm.value.email,
      clientFeatureCode: clientFeatureCode,
    });
    ElMessage.success(response.data.message);
    startCountdown();
  } catch (error: any) {
    isSending.value = false;
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);

    if (errorMessage.includes("UUID 已存在")) {
      ElMessage.warning("UUID 已存在，请稍后再试或清除缓存重试。");
    }
  }
}, 1000);

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value!);
  }
});

const openQQLoginDialog = async () => {};
const openWeChatLoginDialog = async () => {};
const openWeBlogLoginDialog = async () => {};
</script>

<style lang="less" scoped>
.login-wrapper {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

/* 登录页面 - 水平居中 */
.login-center-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.login-modal {
  background: #fff;
  border-radius: 16px;
  width: 800px;
  height: 400px;
  padding: 0 0 24px 0;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12),
    0 1.5px 4px rgba(64, 158, 255, 0.08),
    0 0.5px 0.5px rgba(64, 158, 255, 0.08) inset;
  background-position: 0 100%, 100% 100%;
  background-repeat: no-repeat, no-repeat;
  background-size: 14%;
  position: relative;
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 18px 0;
  cursor: pointer;
  font-size: 18px;
  color: #409eff;
}

.tab.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
  font-weight: bold;
}

.login-content {
  padding: 32px 40px 0 40px;
}

.login-links {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.login-button {
  width: 100%;
  margin-top: 12px;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 35px 40px 0 40px;

  .register-btn,
  .login-button {
    flex: 1;
    margin: 0 8px;
  }

  .register-btn {
    background: #f5f5f5;
    color: #409eff;
    border: none;
  }

  .login-button {
    background-color: #409eff;
    color: #fff;
  }
}

.other-login-options {
  text-align: center;
  margin-top: 25px;
}

.login-methods {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 12px;
}

.login-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #409eff;
    transform: translateY(-2px);
  }
}

.login-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
  margin-right: 6px;
  font-size: 18px;
  vertical-align: middle;
}

.login-tip {
  font-size: 12px;
  color: #999;
  padding: 0 20px;
  line-height: 1.5;
}

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
  cursor: pointer;
}
</style>
