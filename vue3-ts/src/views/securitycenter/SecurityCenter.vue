<template>
  <div class="security-center">
    <!-- 安全中心头部 -->
    <header class="security-header">
      <div class="header-content">
        <div class="header-icon" @click="openAuthorProfile">
          <img
            v-if="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            v-lazy="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            alt="头像"
            :title="`用户${user?.nickname || '默认用户'}的头像`"
            width="70"
            height="70"
            style="border-radius: 50%"
          />
        </div>
        <div class="header-text">
          <h1
            :style="{
              color: user?.nicknameColor || '#fff',
              fontWeight: 'bold',
            }"
          >
            {{ user?.nickname }}
          </h1>
          <p class="description">立即提升账号安全等级，快速掌握安全设置</p>
        </div>
        <!-- 安全提示 -->
      </div>
    </header>

    <!-- 安全中心主要内容 -->
    <main class="security-main">
      <div class="container">
        <!-- 账号安全等级 -->
        <section class="security-level">
          <component :is="AccountSecurityIcon" class="security-icons" />
          <h2 class="section-title">账号安全等级</h2>
          <div class="level-indicator">
            <div class="level-bar">
              <div
                class="level-progress"
                :style="{ width: securityLevel + '%' }"
              ></div>
            </div>
            <span class="level-text">{{ securityText }}</span>
          </div>
          <div class="level-tips">
            完成更多安全设置可提升账号安全等级，保护账号不受侵害
          </div>
        </section>

        <!-- 安全功能模块 -->
        <!-- 安全功能模块 -->
        <section class="security-features">
          <h2 class="section-title">安全功能</h2>
          <div class="feature-grid">
            <div
              v-for="feature in securityFeatures"
              :key="feature.id"
              class="feature-card"
              @click="feature.handler"
              :title="`请根据指引${feature.title}进行操作`"
            >
              <div class="feature-icon">
                <component :is="feature.icon" />
              </div>
              <div class="feature-content">
                <h3>{{ feature.title }}</h3>
                <p>
                  {{
                    typeof feature.description === "function"
                      ? feature.description()
                      : feature.description
                  }}
                </p>
              </div>
              <div class="feature-action">
                <component :is="rightarrowIcon" class="icon-arrow-right" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import FoundpasswordIcon from "../../components/icon/Foundpassword.vue";
import LogindevicemanageIcon from "../../components/icon/Logindevicemanage.vue";
import phoneIcon from "../../components/icon/phone.vue";
import rightarrowIcon from "../../components/icon/rightarrow.vue";
import AccountSecurityIcon from "../../components/icon/AccountSecurity.vue";
import ReportUserIcon from "../../components/icon/ReportUser.vue";
import QQLogin from "../../components/icon/QQLogin.vue";

const router = useRouter();
const { openAuthorProfile } = useUserStore();
const settingRef = ref();
const userStore = useUserStore();
const user = computed(() => userStore.user);

// 计算是否拥有独立密码
const hasIndependentPassword = computed(() => {
  // 根据用户数据判断是否拥有独立密码
  return !!(
    user.value.hasIndependentPassword ||
    user.value.password ||
    (user.value.authMethods && user.value.authMethods.includes("password"))
  );
});

// 计算是否查看过设备管理
const hasViewedDeviceManagement = computed(() => {
  // 根据用户数据判断是否查看过设备管理
  return !!(
    user.value.hasViewedDeviceManagement ||
    (user.value.securityActions &&
      user.value.securityActions.includes("view_device_management"))
  );
});

// 计算安全等级
const securityLevel = computed(() => {
  let level = 30; // 基础分

  // 绑定手机 +30分
  if (user.value.phone) level += 30;

  // 独立密码 +20分
  if (hasIndependentPassword.value) level += 20;

  // 绑定邮箱 +20分
  if (user.value.email) level += 20;

  // 查看设备管理 +10分
  if (hasViewedDeviceManagement.value) level += 10;

  return Math.min(level, 100);
});

const securityText = computed(() => {
  if (securityLevel.value >= 90) return "极高安全";
  if (securityLevel.value >= 80) return "非常安全";
  if (securityLevel.value >= 60) return "安全";
  if (securityLevel.value >= 40) return "一般";
  return "较低";
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

// 处理功能点击
const handlePasswordRecovery = () => {
  router.push({ name: "resetpassword" });
};

const handlePhoneBinding = () => {
  // 要么就是绑定了手机号要么就是没绑定
  if (user.value.phone) {
    ElMessage.info("手机号已绑定,请勿重复操作");
  } else {
    ElMessage.info("手机号未绑定,请根据指引进行绑定");
    router.push("/setting/personals");
  }
};

const handleDeviceManagement = () => {
  // 标记用户已查看设备管理
  // 这里可以调用API更新用户状态或使用Vuex/Pinia存储状态
  router.push({ name: "devicemanagement", params: { uuid: user.value.uuid } });
};

const handleQQEmailBinding = () => {
  if (user.value.email) {
    ElMessage.info("QQ邮箱已绑定,请勿重复操作");
  }
};

const securityFeatures = [
  {
    id: "passwordRecovery",
    icon: FoundpasswordIcon,
    title: "找回密码",
    description: "忘记Deep Sea账号密码? 从这里找回",
    handler: handlePasswordRecovery,
  },
  {
    id: "phoneBinding",
    icon: phoneIcon,
    title: "手机号绑定",
    description: computed(() =>
      user.value.phone ? `已绑定: ${maskedPhone.value}` : "未绑定手机号"
    ),
    status: computed(() =>
      user.value.phone
        ? { text: "已绑定", bound: true }
        : { text: "未绑定", bound: false }
    ),
    handler: handlePhoneBinding,
  },
  {
    id: "deviceManagement",
    icon: LogindevicemanageIcon,
    title: "登录设备管理",
    description: "查看和管理已登录的设备",
    handler: handleDeviceManagement,
  },
  {
    id: "qqEmail",
    icon: QQLogin,
    title: "QQ邮箱绑定",
    description: computed(() =>
      user.value.email ? `已绑定: ${maskedEmail.value}` : "未绑定QQ邮箱"
    ),
    status: computed(() =>
      user.value.email
        ? { text: "已绑定", bound: true }
        : { text: "未绑定", bound: false }
    ),
    handler: handleQQEmailBinding,
  },
];
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap");

// 颜色变量
$primary-color: #4361ee;
$primary-light: #eef2ff;
$success-color: #4cc9f0;
$warning-color: #f8961e;
$danger-color: #f94144;
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
}

.security-header {
  background: linear-gradient(135deg, #b39ddb, #8c9eff);
  color: white;
  padding: 30px 0;
  margin-bottom: 30px;
  box-shadow: $box-shadow;
  border-radius: $border-radius;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
  }

  .header-icon {
    margin-right: 20px;
    background: var(--bg3);
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);

    img {
      object-fit: contain;
    }
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .description {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
    color: var(--color-bg3);
  }
}

.security-main {
  margin: 0 auto;
  padding: 0 20px;

  .container {
    background: var(--bg3);
    border-radius: $border-radius;
    padding: 30px;
    box-shadow: $box-shadow;
    margin-bottom: 30px;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-bg6);
  display: flex;
  align-items: center;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 16px;
    background: var(--bg3);
    margin-right: 10px;
    border-radius: 2px;
  }
  .security-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    color: var(--color-bg6);
    font-size: 20px;
    margin-left: 10px;
  }
}

.security-level {
  margin-bottom: 40px;
  position: relative;
  margin-left: 20px;
  .security-icons {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-bg6);
    font-size: 20px;
    position: absolute;
    left: -35px;
  }
  .level-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .level-bar {
    flex: 1;
    height: 8px;
    background: var(--bg3);
    border-radius: 4px;
    overflow: hidden;
    margin-right: 15px;
  }

  .level-progress {
    height: 100%;
    background: linear-gradient(90deg, $success-color, $primary-color);
    border-radius: 4px;
    transition: $transition;
  }

  .level-text {
    font-weight: 500;
    color: var(--color-bg6);
  }

  .level-tips {
    font-size: 14px;
    color: var(--color-bg6);
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: $border-radius;
  background: var(--bg3);
  cursor: pointer;
  transition: $transition;
  border: 1px solid $gray-light;

  &:hover {
    transform: translateY(-3px);
    box-shadow: $box-shadow;
    border-color: $primary-color;
    background-color: $primary-light;
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    color: var(--color-bg6);
    font-size: 20px;
  }

  .feature-content {
    flex: 1;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 5px;
      color: var(--color-bg6);
    }

    p {
      font-size: 14px;
      color: var(--color-bg6);
      margin: 0;
    }
  }
  .feature-action {
    display: flex;
    align-items: center;

    .icon-arrow-right {
      margin-left: 10px;
      color: var(--color-bg6);
      transition: all 0.3s;
      width: 12px;
      height: 12px;
    }
  }
}
</style>
