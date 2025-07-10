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
          <!-- 新增扫码登录 -->
          <span class="login-item" @click="showQrcode = true">
            <svg
              t="1751952716862"
              class="login-icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5293"
              width="200"
              height="200"
            >
              <path
                d="M149.897707 387.566843l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L393.707231 143.757319C393.707231 94.273016 353.614109 54.179894 304.491005 54.179894L149.897707 54.179894c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099C60.320282 347.473721 100.774603 387.566843 149.897707 387.566843zM136.533333 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374l0 154.232099c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 311.353792c-7.223986 0-13.364374-6.140388-13.364374-13.364374L136.533333 143.757319z"
                fill="#575B66"
                p-id="5294"
              ></path>
              <path
                d="M304.491005 628.486772 149.897707 628.486772c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425l0-154.232099C393.707231 668.579894 353.614109 628.486772 304.491005 628.486772zM317.49418 872.296296c0 7.223986-6.140388 13.364374-13.364374 13.364374L149.897707 885.66067c-7.223986 0-13.364374-6.140388-13.364374-13.364374l0-154.232099c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L317.49418 872.296296z"
                fill="#575B66"
                p-id="5295"
              ></path>
              <path
                d="M878.797884 54.179894l-154.232099 0c-49.484303 0-89.577425 40.093122-89.577425 89.577425l0 154.232099c0 49.484303 40.093122 89.577425 89.577425 89.577425l154.232099 0c49.484303 0 89.577425-40.093122 89.577425-89.577425L968.375309 143.757319C968.014109 94.273016 927.920988 54.179894 878.797884 54.179894zM891.801058 297.989418c0 7.223986-6.140388 13.364374-13.364374 13.364374l-154.232099 0c-7.223986 0-13.364374-6.140388-13.364374-13.364374L710.840212 143.757319c0-7.223986 6.140388-13.364374 13.364374-13.364374l154.232099 0c7.223986 0 13.364374 6.140388 13.364374 13.364374L891.801058 297.989418z"
                fill="#575B66"
                p-id="5296"
              ></path>
              <path
                d="M673.997884 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-126.058554 0L547.578131 338.443739c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929L475.338272 480.395062 96.440212 480.395062c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929l379.620459 0 0 169.04127c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-169.04127L673.997884 552.634921z"
                fill="#575B66"
                p-id="5297"
              ></path>
              <path
                d="M932.255379 552.273721c19.865961 0 36.119929-15.892769 35.75873-36.119929 0-19.865961-15.892769-36.119929-36.119929-36.119929l-79.825044 0c-19.865961 0-36.119929 15.892769-36.119929 36.119929 0 19.865961 15.892769 36.119929 36.119929 36.119929L932.255379 552.273721z"
                fill="#575B66"
                p-id="5298"
              ></path>
              <path
                d="M511.8194 166.874074c19.865961 0 36.119929-15.892769 36.119929-36.119929L547.93933 88.855026c0-19.865961-15.892769-36.119929-36.119929-35.75873-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118C476.06067 150.620106 491.953439 166.874074 511.8194 166.874074z"
                fill="#575B66"
                p-id="5299"
              ></path>
              <path
                d="M511.8194 849.179541c-19.865961 0-36.119929 15.892769-36.119929 36.119929l0 41.899118c0 19.865961 15.892769 36.119929 36.119929 36.119929s36.119929-15.892769 36.119929-36.119929l0-42.260317C547.93933 865.07231 531.685362 849.179541 511.8194 849.179541z"
                fill="#575B66"
                p-id="5300"
              ></path>
              <path
                d="M892.884656 871.573898c0 7.223986-6.140388 13.003175-13.003175 13.003175l-38.648325 0 0 75.129453 38.648325 0c48.761905 0 88.493827-39.731922 88.493827-88.493827l0-43.705115-75.129453 0L893.245855 871.573898z"
                fill="#575B66"
                p-id="5301"
              ></path>
              <path
                d="M879.520282 631.015168l-152.426102 0c-48.761905 0-88.493827 39.731922-88.493827 88.493827l0 152.426102c0 48.761905 39.731922 88.493827 88.493827 88.493827l38.648325 0L765.742504 884.938272l-38.648325 0c-7.223986 0-13.003175-6.140388-13.003175-13.003175l0-152.426102c0-7.223986 6.140388-13.003175 13.003175-13.003175l152.426102 0c7.223986 0 13.003175 6.140388 13.003175 13.003175l0 33.591534L968.014109 753.100529l0-33.591534C968.014109 670.74709 928.282187 631.015168 879.520282 631.015168z"
                fill="#575B66"
                p-id="5302"
              ></path>
            </svg>
            扫码登录
          </span>
        </div>
        <!-- 扫码弹窗 -->
        <el-dialog
          v-model="showQrcode"
          width="320px"
          :show-close="false"
          center
        >
          <template #title>
            扫码登录
            <div class="qrcode-title">
              为了您的账号安全，请使用 Deep Sea App 扫码登录
            </div>
          </template>
          <p class="login-tip login-tip-center">
            当前扫码登录暂不可用 请使用密码或邮箱登录
          </p>
          <div class="qrcode-box">
            <canvas ref="qrcodeCanvas" class="qrcode-canvas"></canvas>
          </div>
          <div class="qrcode-tip">
            管理员或已有账号的用户可以直接扫码登录哦~
          </div>
        </el-dialog>
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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import debounce from "lodash.debounce";
import axiosConfig from "../../utils/request";
import { handleLoginError } from "../../utils/handleLoginError";
import { handleLoginSuccess } from "../../utils/handleLoginSuccess";
import Cookies from "js-cookie";
import { View, Hide } from "@element-plus/icons-vue";
const router = useRouter();
let isInputFocused = ref(false);
let showQrcode = ref(false);
let qrcodeUrl = ref("");
let isSending = ref(false);
let countdown = ref(60);
let loading = ref(false);
const accountsclientFeatureCode = localStorage.getItem("userFeatureCode");
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
let activeTab = ref("password");
let loginForm = ref({
  email: "",
  password: "",
});
let smsForm = ref({ email: "", code: "" });
let showPassword = ref(false);
import QRCode from "qrcode";
let qrcodeCanvas = ref<HTMLCanvasElement | null>(null);
let validateEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};
watch(showQrcode, async (val) => {
  try {
    if (val) {
      const res = await axiosConfig.post("/auth/qrcode");
      const qrcodeId = res.data.data.qrcodeId;
      const textToEncode = `http://localhost:3000/auth/image/${qrcodeId}`;

      if (qrcodeCanvas.value) {
        await QRCode.toCanvas(qrcodeCanvas.value, textToEncode, {
          width: 200,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      }
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
});
let validate = () => {
  if (!loginForm.value.email) {
    ElMessage.error("请你的输入账号/邮箱~");
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
  if (activeTab.value === "password") {
    // 密码登录
    if (!validate()) return;
    loading.value = true;
    try {
      const response = await axiosConfig.post("/auth/sign_in", {
        login: loginForm.value.email,
        password: loginForm.value.password,
      });
      loading.value = false;

      Cookies.set("ds-token", response.data.data.token);
      ElMessage.success(response.data.message);

      const user = (await axiosConfig.get("/users/me")).data.data;
      handleLoginSuccess(user, { value: locale.value }, router);

      router.push("/home");
    } catch (error: any) {
      handleLoginError(error);
    }
  } else if (activeTab.value === "sms") {
    if (!validateEmailAndCode()) return;
    try {
      const response = await axiosConfig.post("/auth/email", {
        email: smsForm.value.email,
        code: smsForm.value.code,
        clientFeatureCode: accountsclientFeatureCode,
      });
      ElMessage.success(response.data.message);
      loading.value = false;
      Cookies.set("ds-token", response.data.data.token);
      const user = (await axiosConfig.get("/users/me")).data.data;
      handleLoginSuccess(user, { value: locale.value }, router);
      router.push("/home");
    } catch (error: any) {
      // 兼容 message 字段
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  }
}, 1000); // 设置 1 秒的延迟
let sendSmsCode = async () => {
  if (isSending.value) return;

  if (!smsForm.value.email) {
    ElMessage.error("请输入你的邮箱/手机号~");
    return;
  }
  if (!validateEmail(smsForm.value.email)) {
    ElMessage.error("邮箱格式不正确~");
    return;
  }

  // 检查 accountsuuid 是否有效
  let clientFeatureCode = accountsclientFeatureCode;
  if (!clientFeatureCode || clientFeatureCode.trim() === "") {
    clientFeatureCode = null; // 如果无效，设置为 null，让后端生成新的 UUID
  }

  isSending.value = true;
  try {
    const response = await axiosConfig.post("/auth/email/verify", {
      email: smsForm.value.email,
      clientFeatureCode: clientFeatureCode,
    });
    ElMessage.success(response.data.message);
    let timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        isSending.value = false;
        countdown.value = 60;
      }
    }, 1000);
  } catch (error: any) {
    isSending.value = false;
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);

    // 如果是 UUID 冲突错误，提示用户重新生成
    if (errorMessage.includes("UUID 已存在")) {
      ElMessage.warning("UUID 已存在，请稍后再试或清除缓存重试。");
    }
  }
};
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
.send-code-btn {
  position: absolute;
  right: 10px;
  top: 0;
  color: #409eff;
}
.qrcode-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}
.qrcode-img {
  width: 180px;
  height: 180px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.qrcode-tip,
.qrcode-title {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  text-align: center;
}
</style>
