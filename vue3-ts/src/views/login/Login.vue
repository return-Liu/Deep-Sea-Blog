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
                    placeholder="请输入你的邮箱"
                    @blur="validateEmailFormat"
                  />
                </el-form-item>

                <el-form-item label="邮箱验证码">
                  <el-input
                    v-model="smsForm.code"
                    placeholder="请输入邮箱验证码"
                    @focus="isInputFocused = true"
                    @blur="isInputFocused = false"
                  />
                  <span
                    :style="
                      isSending ? 'pointer-events: none; opacity: 0.6;' : ''
                    "
                    @click="handleSendCodeClick"
                    :disabled="isSending || !canSendEmailCode"
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
import { ref, onUnmounted, onMounted, computed, watch } from "vue";
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

let loginAttempts = ref(0);
let isAccountLocked = ref(false);
let lockTimeout: any = null;
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

// 行为验证码相关变量
const captchaVerified = ref(false);
const captchaSessionId = ref("");
const countdownTimer = ref<number | null>(null);
let activeTab = ref("password");
let loginForm = ref({
  email: "",
  password: "",
});
let smsForm = ref({
  email: "",
  code: "",
});
let showPassword = ref(false);

// 计算属性：是否可以发送邮箱验证码
const canSendEmailCode = computed(() => {
  return smsForm.value.email && validateEmail(smsForm.value.email);
});

const handleLoginFailure = () => {
  loginAttempts.value++;
  if (loginAttempts.value >= 5) {
    isAccountLocked.value = true;
    ElMessage.error("多次登录失败，账户已被锁定，请稍后再试");

    lockTimeout = setTimeout(() => {
      isAccountLocked.value = false;
      loginAttempts.value = 0;
    }, 60 * 1000);
  }
};

// 监听tab切换
watch(activeTab, (newTab) => {
  if (newTab === "password") {
    // 切换到密码登录时重置验证状态
    captchaVerified.value = false;
    captchaSessionId.value = "";
  }
});

let validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// 邮箱格式验证
const validateEmailFormat = () => {
  if (smsForm.value.email && !validateEmail(smsForm.value.email)) {
    ElMessage.error("请输入正确的邮箱格式");
    return false;
  }
  return true;
};

// 直接调用腾讯验证码
const showTencentCaptcha = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 检查腾讯验证码JS是否已加载
    if (!(window as any).TencentCaptcha) {
      reject(new Error("腾讯验证码JS未加载，请刷新页面重试"));
      return;
    }

    try {
      const captcha = new (window as any).TencentCaptcha(
        "193647721", // 您的CaptchaAppId
        (res: any) => {
          if (res.ret === 0) {
            // 验证成功
            resolve({
              ticket: res.ticket,
              randstr: res.randstr,
              captchaAppId: "193647721",
            });
          } else if (res.ret === 2) {
            // 用户取消验证
            reject(new Error("用户取消验证"));
          } else {
            // 验证失败
            reject(new Error(`验证失败，请重试 (错误码: ${res.ret})`));
          }
        },
        {
          themeColor: "#00a1d6",
          enableDarkMode: false,
        }
      );

      // 显示验证码
      captcha.show();
    } catch (error) {
      reject(error);
    }
  });
};

// 点击获取验证码按钮
const handleSendCodeClick = async () => {
  if (!smsForm.value.email) {
    ElMessage.error("请输入你的邮箱~");
    return;
  }
  if (!validateEmail(smsForm.value.email)) {
    ElMessage.error("邮箱格式不正确~");
    return;
  }

  if (isSending.value) {
    return;
  }

  try {
    // 显示腾讯验证码
    const captchaData = await showTencentCaptcha();

    // 验证通过，调用后端验证接口
    const verifyResponse = await axiosConfig.post(
      "/auth/verify-tencent-captcha",
      {
        ticket: captchaData.ticket,
        randstr: captchaData.randstr,
        captchaAppId: captchaData.captchaAppId,
        email: smsForm.value.email, // 传递邮箱
      }
    );
    ElMessage.success("验证成功，请稍等...");
    ElMessage.success(verifyResponse.data.message);
    // 启动倒计时
    startCountdown();
  } catch (error) {
    // 验证失败，处理错误
    ElMessage.error("验证失败，请重试");
    return;
  }
};

let validate = () => {
  if (!loginForm.value.email) {
    ElMessage.error("请输入账号/邮箱~");
    return false;
  }
  if (!loginForm.value.password) {
    ElMessage.error("请输入密码~");
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
    ElMessage.error("请输入你的邮箱验证码~");
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
      // 直接发送明文密码（已移除加密）
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
    handleLoginFailure();
    handleLoginError(error);

    // 处理冻结错误
    if (
      error?.response?.data?.code === "USER_FROZEN" ||
      error?.response?.data?.message?.includes("冻结") ||
      error?.response?.data?.data?.isFrozen === true ||
      error?.response?.data?.data?.isFrozen === 1
    ) {
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
  } finally {
    loading.value = false;
  }
}, 1000);

const accountsclientFeatureCode = Cookies.get("userFeatureCode");

// 启动倒计时
const startCountdown = () => {
  isSending.value = true;
  countdown.value = 60;

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

onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value!);
  }
  if (lockTimeout) {
    clearTimeout(lockTimeout);
  }
});

const openQQLoginDialog = async () => {
  ElMessage.info("QQ登录功能即将上线，敬请期待！");
};
const openWeChatLoginDialog = async () => {
  ElMessage.info("微信登录功能即将上线，敬请期待！");
};
const openWeBlogLoginDialog = async () => {
  ElMessage.info("微博登录功能即将上线，敬请期待！");
};
</script>

<style lang="less" scoped>
@import "../../base-ui/login.less";

// 动画效果
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.other-login-options {
  color: #000;
}
</style>
