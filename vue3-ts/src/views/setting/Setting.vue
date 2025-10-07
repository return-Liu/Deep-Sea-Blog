<template>
  <div class="settings-page">
    <div class="settings-wrapper">
      <h1 class="page-title">
        {{ t("settings.title." + activeTab) }}
      </h1>
      <div class="settings-layout">
        <div class="settings-nav">
          <div class="profile-card">
            <el-upload
              class="avatar-uploader"
              :action="`${apiUrl}/admin/uploadavatar`"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleSuccess"
              method="post"
              :data="{ userId: userStore.user.id }"
              name="avatar"
              :auto-upload="false"
              ref="uploadRef"
              @change="handleChange"
            >
              <div class="avatar-container" @click="editImage()">
                <img
                  v-if="avatar || defaultAvatar"
                  v-lazy="avatar || defaultAvatar"
                  class="avatar"
                />
                <div class="avatar-mask">
                  <el-icon><Camera /></el-icon>
                  <span>{{ t("settings.profile.changeAvatar") }}</span>
                </div>
              </div>
            </el-upload>

            <h3 :style="{ color: nicknameColor }" class="profile-name">
              {{ nickname || t("settings.profile.nicknamePlaceholder") }}
            </h3>
            <div class="chose-nickname-color" v-show="showNicknameColorCard">
              <el-input
                v-model="nicknameColor"
                class="nickname-color-input"
                type="color"
                :placeholder="t('settings.title.changenicknamecolor')"
              />
            </div>
            <div
              class="nickname-color-label"
              @click="showNicknameColorCard = !showNicknameColorCard"
            >
              {{ t("settings.title.changenicknamecolor") }}
            </div>
          </div>
          <div class="nav-menu">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              class="nav-item"
              :class="{ active: activeTab === tab.id }"
              @click="changeTab(tab.id)"
            >
              <el-icon><component :is="tab.icon" /></el-icon>
              {{ t("settings.title." + tab.id) }}
            </div>
          </div>
        </div>
        <div class="settings-main">
          <el-form
            v-if="activeTab === 'personals'"
            class="settings-form"
            label-position="top"
          >
            <el-card class="form-card">
              <template #header>
                <div class="card-header">
                  <h2 class="card-title">
                    {{ t("settings.title.personals") }}
                  </h2>

                  <div
                    type="primary"
                    class="avatar-upload"
                    native-type="submit"
                    @click="updateUserInfo"
                  >
                    <el-icon><SuccessFilled /></el-icon>
                    <span>{{ t("settings.profile.saveChanges") }}</span>
                  </div>
                </div>
              </template>
              <el-form-item :label="t('settings.profile.username')">
                <el-input
                  v-model="userStore.user.username"
                  :placeholder="t('settings.profile.username')"
                  disabled
                />
              </el-form-item>
              <el-form-item :label="t('settings.profile.phone')">
                <el-input
                  v-model="phone"
                  :placeholder="t('settings.profile.phone')"
                />
              </el-form-item>
              <el-form-item :label="t('settings.profile.nickname')">
                <el-input
                  v-model="nickname"
                  :placeholder="t('settings.profile.nickname')"
                />
              </el-form-item>
              <el-form-item :label="t('settings.profile.FeatureCode')">
                <el-input v-model="clientFeatureCode" :disabled="true" />
              </el-form-item>
              <el-form-item :label="t('settings.profile.gender')">
                <el-radio-group v-model="sex">
                  <el-radio label="1">{{
                    t("settings.profile.male")
                  }}</el-radio>
                  <el-radio label="2">{{
                    t("settings.profile.female")
                  }}</el-radio>
                  <el-radio label="0">{{
                    t("settings.profile.secret")
                  }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="t('settings.profile.area')">
                <el-select
                  v-model="area"
                  :placeholder="t('settings.profile.chooseArea')"
                >
                  <el-option
                    v-for="item in areaes"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('settings.profile.birthday')">
                <el-date-picker
                  v-model="birthday"
                  chooseConstellation
                  type="date"
                  :placeholder="t('settings.profile.chooseBirthday')"
                  format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item :label="t('settings.profile.constellation')">
                <el-select
                  v-model="constellation"
                  :placeholder="t('settings.profile.chooseConstellation')"
                >
                  <el-option
                    v-for="item in constellationes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('settings.profile.signature')">
                <el-input
                  v-model="introduce"
                  type="textarea"
                  :rows="4"
                  :placeholder="t('settings.profile.signaturePlaceholder')"
                />
              </el-form-item>
            </el-card>
          </el-form>
          <div v-if="activeTab === 'securitys'">
            <el-card class="form-card danger-zone">
              <template #header>
                <div class="card-header">
                  <h2 class="card-title">
                    {{ t("settings.title.securitys") }}
                  </h2>
                </div>
              </template>
              <div class="danger-actions">
                <div class="action-item">
                  <div class="action-info">
                    <h4>{{ t("settings.security.logout") }}</h4>
                    <p>{{ t("settings.security.logoutDesc") }}</p>
                  </div>
                  <el-button @click="logout">{{
                    t("settings.security.logout")
                  }}</el-button>
                </div>
                <div class="action-item">
                  <div class="action-info">
                    <h4>{{ t("settings.security.delete") }}</h4>
                    <p>{{ t("settings.security.deleteDesc") }}</p>
                  </div>
                  <el-button type="danger" @click="deleteAccount">{{
                    t("settings.security.delete")
                  }}</el-button>
                </div>
                <div class="action-item">
                  <div class="action-info">
                    <h4>{{ t("settings.security.changePassword") }}</h4>
                    <p>{{ t("settings.security.changePasswordDesc") }}</p>
                  </div>
                  <el-button @click="changePassword">{{
                    t("settings.security.changePassword")
                  }}</el-button>
                </div>
              </div>
            </el-card>
          </div>
          <div v-if="activeTab === 'likes'" class="like-section">
            <h2 class="like-title">{{ t("settings.title.likes") }}</h2>
            <div v-if="likedArticles.length > 0">
              <div
                class="like-item"
                v-for="article in likedArticles"
                :key="article.id"
              >
                <el-icon class="like-icon"><HeartOutlined /></el-icon>
                <div>
                  <img v-lazy="article.image" class="like-image" />
                  <div class="like-content">
                    <h3 class="like-title">{{ article.title }}</h3>
                    <p class="like-description">{{ article.content }}</p>
                    <div class="like-tags">
                      <span class="like-tag">{{ article.label }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>
                {{ t("settings.likes.noLikes") }}<br />
                {{ t("settings.likes.noLikesDesc") }}<br />
              </p>
            </div>
          </div>
          <div v-if="activeTab === 'modes'" class="mode-section">
            <h2 class="mode-title">{{ t("settings.title.modes") }}</h2>
            <p class="mode-description">{{ t("settings.mode.description") }}</p>
            <div class="mode-toggles">
              <div class="mode-item">
                <span class="mode-label">{{
                  t("settings.mode.followSystem")
                }}</span>
                <div class="mode-toggle">
                  <el-switch
                    v-model="followSystem"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    @change="toggleTheme(followSystem ? 'auto' : 'light')"
                  />
                </div>
              </div>
              <div class="mode-item" v-if="!followSystem">
                <span class="mode-label">{{ t("settings.mode.dayMode") }}</span>
                <div class="mode-toggle">
                  <el-icon
                    class="check-icon"
                    :class="{ primary: isSunLight }"
                    @click="toggleTheme('light')"
                  >
                    <Check v-if="isSunLight" />
                  </el-icon>
                </div>
              </div>
              <div class="mode-item" v-if="!followSystem">
                <span class="mode-label">{{
                  t("settings.mode.nightMode")
                }}</span>
                <div class="mode-toggle">
                  <el-icon
                    class="check-icon"
                    :class="{ primary: isMoonDark }"
                    @click="toggleTheme('dark')"
                  >
                    <Check v-if="isMoonDark" />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
          <!-- 多种语言模式 -->
          <div v-if="activeTab === 'languages'" class="language-section">
            <h2 class="language-title">{{ t("settings.language.title") }}</h2>
            <p class="language-description">
              {{ t("settings.language.description") }}
            </p>
            <div class="language-buttons">
              <div
                class="language-button"
                :class="{ active: currentLanguage === 'zh' }"
                @click="changeLanguage('zh')"
              >
                {{ t("settings.language.zh") }}
                <span v-if="currentLanguage === 'zh'" class="check-icon">
                  <el-icon class="check-icon">
                    <Check v-if="currentLanguage === 'zh'" />
                  </el-icon>
                </span>
              </div>
              <!-- 繁体中文 -->
              <div
                class="language-button"
                :class="{ active: currentLanguage === '' }"
                @click="changeLanguage('zh_TW')"
              >
                {{ t("settings.language.zh_TW") }}
                <span v-if="currentLanguage === 'zh_TW'" class="check-icon">
                  <el-icon class="check-icon">
                    <Check v-if="currentLanguage === 'zh_TW'" />
                  </el-icon>
                </span>
              </div>
              <div
                class="language-button"
                :class="{ active: currentLanguage === 'en' }"
                @click="changeLanguage('en')"
              >
                {{ t("settings.language.en") }}
                <span v-if="currentLanguage === 'en'" class="check-icon">
                  <el-icon class="check-icon">
                    <Check v-if="currentLanguage === 'en'" />
                  </el-icon>
                </span>
              </div>
            </div>
          </div>
          <div v-if="activeTab === 'toggleaccount'" class="toggle-account">
            <h2 class="toggle-account-title">
              {{ t("settings.toggleaccount.title") }}
            </h2>
            <p class="toggle-account-description">
              {{ t("settings.toggleaccount.description") }}
            </p>
            <div class="toggle-account-content">
              <!-- 可切换账号列表 -->
              <div class="switchable-accounts">
                <h3 class="switchable-accounts-title">
                  {{ t("settings.toggleaccount.currentAccount") }}
                </h3>
                <ul class="account-list">
                  <li
                    @click="switchAccount(account.id)"
                    v-for="account in accounts"
                    :key="account.id"
                    class="account-item"
                  >
                    <img
                      style="width: 50px; height: 50px; border-radius: 50%"
                      v-if="account.avatar || defaultAvatar"
                      v-lazy="account.avatar || defaultAvatar"
                      class="account-avatar"
                    />
                    <div class="account-details">
                      <div
                        :style="{ color: account.nicknameColor }"
                        class="account-nickname"
                      >
                        {{ account.nickname }}
                        <span
                          v-if="userStore.user.id === Number(account.id)"
                          class="current-badge"
                          >(当前)</span
                        >
                        <!-- 冻结账号 -->
                        <span v-if="account.isFrozen" class="frozen-badge"
                          >(冻结)</span
                        >
                      </div>
                      <div class="account-id">
                        账号ID: {{ account.username }}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <!-- 添加新账号 -->
              <div class="add-new-account" @click="addNewAccount">
                <el-icon name="plus"></el-icon>
                <span>{{ t("settings.toggleaccount.addNewAccount") }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <avatar-cropper
      ref="avatarCropper"
      :title="t('settings.profile.cropAvatar')"
      :preview-title="t('settings.profile.Previewavatar')"
      :select-image-text="t('settings.profile.selectImage')"
      :confirm-text="t('settings.profile.confirmCrop')"
      :api-url="apiUrl"
      :user-id="userStore.user.id.toString()"
      @cropped="handleCropped"
    />
    <!-- 自定义冻结弹窗 -->
    <div
      v-if="showFrozenDialogs"
      class="frozen-dialog-overlay"
      @click.self="closeFrozenDialog"
    >
      <div class="frozen-dialog">
        <!-- 头部 -->
        <div class="dialog-header">
          <div class="header-icon">
            <LockOutlined />
          </div>
          <h2 class="dialog-title">账户冻结提示</h2>
          <CloseOutlined class="close-btn" @click="closeFrozenDialog" />
        </div>

        <!-- 主要内容 -->
        <div class="dialog-content">
          <!-- 状态标识 -->
          <div class="status-banner">
            <div class="status-icon">
              <StopOutlined />
            </div>
            <div class="status-text">
              <h3 class="status-title">账户已被冻结</h3>
              <p class="status-subtitle">您的账户因违反平台规定已被限制使用</p>
            </div>
          </div>

          <!-- 账户基本信息 -->
          <div class="basic-info-section">
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">
                  <UserOutlined />
                  用户名
                </span>
                <div class="info-content">
                  <span class="username">{{ currentFrozenData.username }}</span>
                  <span class="freeze-time">{{
                    formatTime(currentFrozenData.frozenAt)
                  }}</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">
                  <SafetyCertificateOutlined />
                  冻结类型
                </span>
                <span
                  class="freeze-type-badge"
                  :class="currentFrozenData.freezeType"
                >
                  <span class="badge-icon">
                    <MinusCircleOutlined
                      v-if="currentFrozenData.freezeType === 'permanent'"
                    />
                    <ClockCircleOutlined v-else />
                  </span>
                  {{ getFreezeTypeText(currentFrozenData.freezeType) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">
                  <ExclamationCircleOutlined />
                  冻结原因
                </span>
                <span class="freeze-reason">{{
                  currentFrozenData.frozenReason
                }}</span>
              </div>
            </div>
          </div>

          <!-- 冻结详情 -->
          <div class="detail-section">
            <div class="detail-card">
              <div class="detail-header">
                <FileTextOutlined />
                <span class="detail-title">冻结说明</span>
              </div>
              <p class="detail-content">
                {{ currentFrozenData.frozenMessage }}
              </p>
            </div>
          </div>

          <!-- 冻结状态信息 -->
          <div class="freeze-status-section">
            <!-- 临时冻结信息 -->
            <div
              v-if="
                currentFrozenData.freezeType === 'temporary' &&
                currentFrozenData.unfreezeAt
              "
              class="status-card temporary-card"
            >
              <div class="status-header">
                <ClockCircleOutlined />
                <span class="status-title">解冻时间</span>
              </div>
              <div class="status-content">
                <p class="time-info">
                  {{ formatTime(currentFrozenData.unfreezeAt) }}
                </p>
                <p class="countdown" v-if="countdownText">
                  <FieldTimeOutlined />
                  剩余时间：{{ countdownText }}
                </p>
              </div>
            </div>

            <!-- 临时冻结无时间 -->
            <div
              v-if="
                currentFrozenData.freezeType === 'temporary' &&
                !currentFrozenData.unfreezeAt
              "
              class="status-card temporary-notice"
            >
              <div class="status-header">
                <HourglassOutlined />
                <span class="status-title">临时冻结</span>
              </div>
              <p class="status-text">
                此账户为临时冻结，具体解冻时间请等待管理员通知
              </p>
            </div>

            <!-- 永久冻结信息 -->
            <div
              v-if="currentFrozenData.freezeType === 'permanent'"
              class="status-card permanent-card"
            >
              <div class="status-header">
                <MinusCircleOutlined />
                <span class="status-title">永久冻结</span>
              </div>
              <p class="status-text">
                此账户因严重违规已被永久限制使用，如需申诉请及时联系客服
              </p>
            </div>
          </div>

          <!-- 客服支持 -->
          <div class="support-section">
            <div class="support-card">
              <div class="support-header">
                <CustomerServiceOutlined />
                <p class="support-title">
                  客服支持
                  <span class="beta-badge">测试阶段</span>
                </p>
              </div>
              <p class="support-text">如需申诉或了解详情，请及时联系客服团队</p>
            </div>
            <!-- 系统将自动解除冻结 -->
            <div
              class="auto-unfreeze-note"
              style="color: #ff0202; text-align: center; margin-top: 10px"
              v-if="
                currentFrozenData.freezeType === 'temporary' &&
                currentFrozenData.unfreezeAt
              "
            >
              <span class="note-text">
                账户将在
                {{ formatTime(currentFrozenData.unfreezeAt) }}自动解除冻结
                <span class="note-text">(请勿刷新页面)</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="dialog-actions">
          <button class="btn primary-btn" @click="contactSupport">
            <CustomerServiceOutlined />
            联系客服
          </button>
          <button class="btn secondary-btn" @click="closeFrozenDialog">
            <CloseOutlined />
            关闭
          </button>
          <button
            v-if="currentFrozenData.freezeType === 'temporary'"
            class="btn refresh-btn"
            @click="refreshCountdown"
          >
            <ReloadOutlined />
            刷新状态
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="Setting">
import AvatarCropper from "../../components/avatarcropper/AvatarCropper.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import axiosConfig from "../../utils/request";
import { useRouter, useRoute } from "vue-router";
import Cookies from "js-cookie";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import {
  tabs,
  initialUserInfo,
  constellationes,
  areaes,
} from "../../utils/setting";
import {
  LockOutlined,
  CloseOutlined,
  StopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
  HourglassOutlined,
  CustomerServiceOutlined,
  ReloadOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "../../store/userStore";
import { useThemeStore } from "../../store/themeStore";
import { apiUrl } from "../../config";
import { useI18n } from "vue-i18n";
import { getAllUsers, accounts } from "../../utils/publicuser";
import { type Article } from "../../utils/article";
import { useAvatarManager } from "../../utils/avatarManager";

const { t, locale } = useI18n();
const currentLanguage = computed(() => {
  return locale.value;
});
const defaultAvatar =
  "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const themeStore = useThemeStore();
const { toggleTheme } = themeStore;
const isSunLight = computed(() => themeStore.currentThemeMode === "light");
const isMoonDark = computed(() => themeStore.currentThemeMode === "dark");
const followSystem = computed({
  get: () => themeStore.followSystem,
  set: (value) => {
    if (value) {
      themeStore.toggleTheme("auto");
    } else {
      themeStore.toggleTheme("light");
    }
  },
});

// 图片裁剪功能
const avatarCropper = ref();
const editImage = () => {
  if (!avatar.value) return;
  avatarCropper.value.openCropper(avatar.value);
};

let refreshTimer: number | null = null;
const avatarManager = useAvatarManager();
const setupAvatarRefresh = () => {
  refreshTimer = avatarManager.setupAvatarRefresh(async () => {
    await avatarManager.checkAndUpdateAvatarIfNeeded(
      userStore.user.avatar || "",
      avatarManager.refreshAvatarSignature
    );
  });
};

const handleCropped = async (blob: Blob) => {
  try {
    const newAvatarUrl = URL.createObjectURL(blob);
    avatar.value = newAvatarUrl;
    pendingAvatarBlob.value = blob;
    ElMessage.success("头像裁剪完成，请点击页面顶部的保存按钮以应用更改");
    getAllUsers();
    userStore.loadUser();
  } catch (error: any) {
    const errorMessage = error?.message || "头像处理失败";
    ElMessage.error(errorMessage);
  }
};

// 用户信息相关
const pendingAvatarBlob = ref<Blob | null>(null);
const showNicknameColorCard = ref<boolean>(false);
const nickname = ref<string>("");
const sex = ref<string>("0");
const area = ref<string>("");
const birthday = ref<string>("");
const introduce = ref<string>("");
const avatar = ref<string>("");
const phone = ref<string>("");
const showUploadButton = ref<boolean>(false);
const constellation = ref<string>("");
const clientFeatureCode = ref<string | null>(null);
const nicknameColor = ref<string>("#000000");
const likedArticles = ref<Article[]>([]);
const previousImageUrl = ref<string>("");
const uuid = ref<string | null>(null);
const uploadRef = ref<any>(null);

// 冻结账号相关
const showFrozenDialogs = ref(false);
const currentFrozenData = ref<any>({});
const countdownText = ref("");
const countdownTimer = ref<number | null>(null);

// 图片上传功能
const handleChange = (uploadFile: { raw: File }) => {
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    avatarCropper.value.openCropper(e.target?.result as string);
  };
  reader.readAsDataURL(uploadFile.raw);
};

// 显示冻结账号弹窗
const showFrozenDialog = (frozenData: any) => {
  currentFrozenData.value = frozenData;
  showFrozenDialogs.value = true;

  if (frozenData.freezeType === "temporary" && frozenData.unfreezeAt) {
    startCountdown();
  }
};

// 关闭冻结弹窗
const closeFrozenDialog = () => {
  showFrozenDialogs.value = false;
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

// 格式化时间
const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  return date.toLocaleString("zh-CN");
};

// 冻结类型文本映射
const getFreezeTypeText = (freezeType: string) => {
  const types: Record<string, string> = {
    temporary: "临时冻结",
    permanent: "永久冻结",
  };
  return types[freezeType] || "未知类型";
};

// 启动倒计时
const startCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  updateCountdown();
  countdownTimer.value = window.setInterval(() => {
    updateCountdown();
  }, 1000);
};

// 更新倒计时
const updateCountdown = () => {
  if (
    !currentFrozenData.value.unfreezeAt ||
    currentFrozenData.value.freezeType !== "temporary"
  ) {
    countdownText.value = "";
    return;
  }

  const now = new Date().getTime();
  const unfreezeTime = new Date(currentFrozenData.value.unfreezeAt).getTime();
  const diff = unfreezeTime - now;

  if (diff <= 0) {
    countdownText.value = "已解冻";
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }
    setTimeout(() => {
      closeFrozenDialog();
      ElMessage.success("账户已解冻，请重新登录");
    }, 2000);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownText.value = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
};

// 刷新倒计时
const refreshCountdown = () => {
  if (currentFrozenData.value.freezeType === "temporary") {
    updateCountdown();
    ElMessage.info("状态已刷新");
  }
};

// 联系客服
const contactSupport = () => {
  ElMessage.info("该功能处于测试阶段，请耐心等待");
};

// 切换账号
const switchAccount = async (id: string) => {
  try {
    if (userStore.user.id === Number(id)) {
      ElMessage.info("你已经在该账号下登录啦~");
      return;
    }

    const response = await axiosConfig.post("/auth/switch-account", {
      userId: id,
    });

    if (response.data.data?.isFrozen) {
      const frozenData = response.data.data;
      showFrozenDialog(frozenData);
      return;
    }

    const userData = response.data.data;
    Cookies.set("ds-token", userData.token);
    ElMessage.success(response.data.message);
    fetchUserInfo();
    getAllUsers();
    userStore.loadUser();
    router.push("/home");
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      t("settings.profile.unknownError");
    ElMessage.error(errorMessage);
  }
};

// 组件卸载时清理定时器
onUnmounted(() => {
  avatarManager.cleanupAvatarRefresh();
  if (pendingAvatarBlob.value && avatar.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatar.value);
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});

const addNewAccount = () => {
  logout();
};

const changePassword = () => {
  router.push({ name: "resetpassword" });
};

const activeTab = computed(() => {
  return route.params.tab as string || 'personals';
});

// 切换标签页
const changeTab = (tabId: string) => {
  // 如果已经是当前标签页，则不重复跳转
  if (activeTab.value === tabId) return;

  router.push({
    name: 'setting',
    params: { tab: tabId }
  });
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await axiosConfig.get("/users/me");
    const userInfo = response.data.data;
    nickname.value = userInfo.nickname || "";
    sex.value = userInfo.sex.toString() || "0";
    birthday.value =
      userInfo.birthday || new Date().toISOString().split("T")[0];
    introduce.value = userInfo.introduce || "";
    avatar.value = userInfo.avatar || defaultAvatar;
    uuid.value = userInfo.uuid || "";
    area.value = userInfo.area || "";
    constellation.value = userInfo.constellation || "";
    clientFeatureCode.value = userInfo.clientFeatureCode || null;
    nicknameColor.value = userInfo.nicknameColor || "#000000";
    phone.value = userInfo.phone || "";
    themeStore.user = userInfo.uuid.toString();

    initialUserInfo.value = {
      nickname: nickname.value,
      sex: sex.value,
      birthday: birthday.value,
      introduce: introduce.value,
      avatar: avatar.value,
      constellation: constellation.value,
      nicknameColor: nicknameColor.value,
      area: area.value,
      phone: phone.value,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      t("settings.profile.unknownError");
    ElMessage.error(errorMessage);
  }
};

const changeLanguage = (lang: string) => {
  if (uuid.value) {
    locale.value = lang;
    localStorage.setItem(`language-style-${uuid.value}`, lang);
  }
};

const beforeUpload = (file: File) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jfif",
    "image/gif",
  ];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isAllowedType) {
    ElMessage.error("上传照片只能是 JPG 或 PNG 或 WEBP 或 GIF ");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传照片大小不能超过 2MB!");
    return false;
  }
  if (!uuid.value) {
    ElMessage.error("请先选择一个用户");
    return false;
  }
  return false;
};

const handleSuccess = () => {
  ElMessage.success("头像上传成功");
  uploadRef.value.clearFiles();
  showUploadButton.value = false;
};

// 更新用户信息
const updateUserInfo = async () => {
  const hasChanges =
    nickname.value !== initialUserInfo.value.nickname ||
    sex.value !== initialUserInfo.value.sex ||
    birthday.value !== initialUserInfo.value.birthday ||
    introduce.value !== initialUserInfo.value.introduce ||
    avatar.value !== initialUserInfo.value.avatar ||
    constellation.value !== initialUserInfo.value.constellation ||
    nicknameColor.value !== initialUserInfo.value.nicknameColor ||
    area.value !== initialUserInfo.value.area ||
    phone.value !== initialUserInfo.value.phone;

  if (!hasChanges) {
    ElMessage.info("暂无数据修改");
    return;
  }

  try {
    let avatarUrl = avatar.value;
    if (pendingAvatarBlob.value) {
      const newAvatarUrl = await avatarManager.updateAvatar(
        pendingAvatarBlob.value
      );
      avatarUrl = newAvatarUrl;
      pendingAvatarBlob.value = null;
      URL.revokeObjectURL(avatar.value);
    }

    const response = await axiosConfig.put("/users/info", {
      nickname: nickname.value,
      sex: parseInt(sex.value, 10),
      birthday: birthday.value,
      introduce: introduce.value,
      avatar: avatarUrl,
      constellation: constellation.value,
      nicknameColor: nicknameColor.value,
      area: area.value,
      phone: phone.value,
    });

    const updatedUserInfo = response.data.data;
    nickname.value = updatedUserInfo.nickname || "";
    sex.value = updatedUserInfo.sex.toString() || "0";
    birthday.value = updatedUserInfo.birthday || "";
    introduce.value = updatedUserInfo.introduce || "";
    avatar.value = updatedUserInfo.avatar || previousImageUrl.value;
    constellation.value = updatedUserInfo.constellation || "";
    nicknameColor.value = updatedUserInfo.nicknameColor || "#000000";
    area.value = updatedUserInfo.area || "";
    phone.value = updatedUserInfo.phone || "";
    userStore.setUser(updatedUserInfo);
    getAllUsers();
    userStore.loadUser();

    initialUserInfo.value = {
      nickname: nickname.value,
      sex: sex.value,
      birthday: birthday.value,
      introduce: introduce.value,
      avatar: avatar.value,
      constellation: constellation.value,
      nicknameColor: nicknameColor.value,
      area: area.value,
      phone: phone.value,
    };

    ElMessage.success(response.data.message);
  } catch (error: any) {
    let errorMessage = "添加失败";
    if (
      error?.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      errorMessage = error.response.data.errors[0] || "添加失败";
    } else {
      errorMessage =
        error?.response?.data?.message || error?.message || "添加失败";
    }
    ElMessage.error(errorMessage);
  }
};

// 注销账号
const deleteAccount = async () => {
  try {
    const loading = ElLoading.service({
      lock: true,
      text: "正在注销账号...",
      background: "rgba(0, 0, 0, 0.7)",
    });

    await ElMessageBox.confirm("确定注销账号吗？", "账号注销确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const confirmToken = `${userStore.user.id}_${Date.now()}`;
    const response = await axiosConfig.delete("/users/delete", {
      data: { confirmToken },
    });

    loading.close();
    themeStore.clearThemeInDatabase(userStore.user.id);
    localStorage.removeItem(`theme-${uuid.value}`);
    Cookies.remove("ds-token");

    ElMessage.success(response.data.message);
    router.push({ name: "login/index" });
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      Cookies.remove("ds-token");
      router.push("/login/index");
    } else {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "删除失败，请稍后再试。";
      ElMessage.error(errorMessage);
    }
  }
};

const fetchLikedArticles = async () => {
  try {
    const response = await axiosConfig.get("/admin/article", {
      params: { userId: userStore.user.id },
    });
    const articles = response.data.data.articles;
    likedArticles.value = articles
      .filter((article: any) => article.likesCount === 1)
      .map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        image: article.image,
        likesCount: article.likesCount,
        label: article.label,
      }));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};

const logout = () => {
  Cookies.remove("ds-token");
  router.push("/login/index");
};

// 初始化
onMounted(async () => {
  setupAvatarRefresh();

  await fetchUserInfo();
  await fetchLikedArticles();
  await getAllUsers();
  await userStore.loadUser();

  // 加载语言设置
  const savedLanguage = localStorage.getItem(
    `language-style-${userStore.user.uuid}`
  );
  if (savedLanguage) {
    changeLanguage(savedLanguage);
  }
});
</script>
<style lang="less" scoped>
@import "../../base-ui/setting.less";

:deep(.el-input__wrapper) {
  background: var(--bgColor1);
}

:deep(.el-input__wrapper) {
  background: var(--bgColor1);
}

:deep(.el-select__wrapper) {
  background: var(--bgColor1);
}

:deep(.el-table tr) {
  background: var(--bgColor1);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background: var(--bgColor1);
  color: var(--color-bg3);
}

:deep(.el-textarea__inner) {
  background: var(--bgColor1);
  color: var(--color-bg3);
}
</style>
