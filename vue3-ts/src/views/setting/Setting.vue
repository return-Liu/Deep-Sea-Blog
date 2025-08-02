<template>
  <div class="settings-page">
    <div class="settings-wrapper">
      <h1 class="page-title">
        <!-- 动态值 根据导航来决定 标题 -->
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
              <div class="avatar-container">
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
                    style="margin-left: 490px"
                    v-if="showUploadButton"
                    class="avatar-upload"
                    @click="submitUpload"
                  >
                    <el-icon><Upload /></el-icon>
                    <span>{{ t("settings.profile.uploadAvatar") }}</span>
                  </div>
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
              <div
                class="language-button"
                :class="{ active: currentLanguage === 'ja' }"
                @click="changeLanguage('ja')"
              >
                {{ t("settings.language.ja") }}
                <span v-if="currentLanguage === 'ja'" class="check-icon">
                  <el-icon class="check-icon">
                    <Check v-if="currentLanguage === 'ja'" />
                  </el-icon>
                </span>
              </div>
              <div
                class="language-button"
                :class="{ active: currentLanguage === 'ko' }"
                @click="changeLanguage('ko')"
              >
                {{ t("settings.language.ko") }}
                <span v-if="currentLanguage === 'ko'" class="check-icon">
                  <el-icon class="check-icon">
                    <Check v-if="currentLanguage === 'ko'" />
                  </el-icon>
                </span>
              </div>
            </div>
          </div>
          <!-- 切换账号 -->
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
                      v-if="
                        account.avatar ||
                        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                      "
                      v-lazy="
                        account.avatar ||
                        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                      "
                    />
                    <div class="account-details">
                      <div
                        :style="{ color: account.nicknameColor }"
                        class="account-nickname"
                      >
                        {{ account.nickname }}
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
  </div>
</template>
<script setup lang="ts" name="Setting">
import { ref, computed, onMounted, defineExpose } from "vue";
import axiosConfig from "../../utils/request";
import { useRouter, useRoute } from "vue-router";
import Cookies from "js-cookie";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Camera, User, Lock, Check } from "@element-plus/icons-vue";

import {
  HeartOutlined,
  SkinOutlined,
  GlobalOutlined,
  SwapOutlined,
} from "@ant-design/icons-vue";
import { useUserStore } from "../../store/userStore";
import { useThemeStore } from "../../store/themeStore";
import { constellations } from "../../utils/constellations";
import { areas } from "../../utils/area";
import { apiUrl, modelURL } from "../../config";
import { useI18n } from "vue-i18n";
import { getAllUsers, accounts } from "../../utils/publicuser";
import languagesIcon from "../../components/icon/Languages.vue";
// 省略其他导入
const { t, locale } = useI18n();
const currentLanguage = computed(() => {
  return locale.value;
});
interface Article {
  id: number;
  title: string;
  content: string;
  image: string;
  likesCount: number;
  label: string;
}
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
const constellationes = ref(
  constellations.map((item) => ({
    value: item.value,
    label: item.label,
  }))
);
const areaes = ref(
  areas.map((item) => ({
    value: item.value,
    name: item.name,
  }))
);

const nicknameColor = ref<string>("#000000");
const likedArticles = ref<Article[]>([]);
const previousImageUrl = ref<string>("");
const activeTab = ref<string>(
  Array.isArray(route.params.tab)
    ? route.params.tab[0]
    : route.params.tab || "personal"
);
const uuid = ref<string | null>(null);
const uploadRef = ref<any>(null);
// 记录初始信息
const initialUserInfo = ref<{
  nickname: string;
  sex: string;
  birthday: string;
  introduce: string;
  avatar: string;
  constellation: string;
  nicknameColor: string;
  area: string;
  phone?: string;
}>({
  nickname: "",
  sex: "0",
  birthday: "",
  introduce: "",
  avatar: "",
  constellation: "",
  nicknameColor: "",
  area: "",
  phone: "",
});
const tabs = [
  {
    id: "personals",
    icon: User,
  },
  {
    id: "securitys",
    icon: Lock,
  },
  {
    id: "likes",
    icon: HeartOutlined,
  },
  {
    id: "modes",
    icon: SkinOutlined,
  },
  {
    id: "languages",
    icon: languagesIcon,
  },
  {
    id: "toggleaccount",
    icon: SwapOutlined,
  },
];
const checkMaintenanceMode = () => {
  if (modelURL === "true") {
    ElMessage.warning("我们正在努力升级服务，请稍后再来查看~");
    return true; // 表示处于维护模式
  }
  return false; // 不在维护模式中
};
const addNewAccount = () => {
  logout();
};
const switchAccount = async (id: string) => {
  try {
    const user = userStore.user;
    if (userStore.user.id === Number(id)) {
      ElMessage.info("你已经在该账号下登录啦~");
      return;
    }
    const response = await axiosConfig.post("/auth/switch-account", {
      userId: id,
    });
    const userData = response.data.data;
    // 更新 token 和 uuid 到本地存储
    Cookies.set("ds-token", userData.token);
    ElMessage.success(response.data.message);
    // 刷新用户信息，确保 UI 数据同步
    fetchUserInfo();
    getAllUsers(); // 重新获取账号列表
    userStore.loadUser();
    // 跳转到首页或其他页面
    router.push("/home");
  } catch (error: any) {
    // 错误提示
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};

const changePassword = () => {
  router.push({ name: "resetpassword" });
};

const submitUpload = () => {
  uploadRef.value.submit();
};

const handleChange = (file: File, fileList: File[]) => {
  if (!uuid.value) {
    ElMessage.error("ID未找到，请重新登录");
    return;
  }
  showUploadButton.value = fileList.length > 0;
};

const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  router.push({ name: "setting", params: { tab: tabId } });
};
const fetchUserInfo = async () => {
  try {
    const response = await axiosConfig.get("/users/me");
    const userInfo = response.data.data;
    nickname.value = userInfo.nickname || "";
    sex.value = userInfo.sex.toString() || "0";
    birthday.value =
      userInfo.birthday || new Date().toISOString().split("T")[0];
    introduce.value = userInfo.introduce || "";
    avatar.value =
      userInfo.avatar ||
      "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
    uuid.value = userInfo.uuid || "";
    area.value = userInfo.area || "";
    constellation.value = userInfo.constellation || "";
    clientFeatureCode.value = userInfo.clientFeatureCode || null;
    nicknameColor.value = userInfo.nicknameColor || "#000000";
    phone.value = userInfo.phone || "";
    themeStore.user = userInfo.uuid.toString();

    // 记录初始状态
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
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const changeLanguage = (lang: string) => {
  if (uuid.value) {
    locale.value = lang;
    localStorage.setItem(`language-${uuid.value}`, lang);
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
    ElMessage.error(
      "上传图片只能是 JPG 或 PNG 或 WEBP 或 JFIF 格式 或 GIF 格式!"
    );
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }
  if (!uuid.value) {
    ElMessage.error("ID未找到，请重新登录");
    return false;
  }

  if (avatar.value) {
    deleteOldAvatar(true);
  }
  return true;
};
const deleteOldAvatar = async (isReupload: boolean) => {
  try {
    // 如果是默认头像，直接跳过删除
    if (
      !avatar.value ||
      avatar.value.includes(
        "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
      )
    ) {
      return;
    }
    const url = new URL(avatar.value);
    const avatarFileName = url.pathname.split("/").pop();
    await axiosConfig.delete(
      `${apiUrl}/admin/uploadavatar/avatar/${avatarFileName}`
    );
    if (isReupload) {
      ElMessage.error("旧头像已删除, 已重新上传新头像");
    } else {
      ElMessage.info("头像删除成功");
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const handleSuccess = (response: any, file: File) => {
  avatar.value = `${apiUrl}/avatar/${response.data.avatar}`;
  ElMessage.success("头像上传成功");
  uploadRef.value.clearFiles();
  showUploadButton.value = false;
};
// 更新信息
const updateUserInfo = async () => {
  // 检查信息是否发生更改
  if (
    nickname.value === initialUserInfo.value.nickname &&
    sex.value === initialUserInfo.value.sex &&
    birthday.value === initialUserInfo.value.birthday &&
    introduce.value === initialUserInfo.value.introduce &&
    avatar.value === initialUserInfo.value.avatar &&
    constellation.value === initialUserInfo.value.constellation &&
    nicknameColor.value === initialUserInfo.value.nicknameColor &&
    area.value === initialUserInfo.value.area &&
    phone.value === initialUserInfo.value.phone
  ) {
    ElMessage.info("没有发现任何更改,请修改后再来保存");
    return;
  }
  try {
    const response = await axiosConfig.put("/users/info", {
      nickname: nickname.value,
      sex: parseInt(sex.value, 10),
      birthday: birthday.value,
      introduce: introduce.value,
      avatar: avatar.value,
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
    // 更新初始状态
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
    let errorMessage = "未知错误";

    // 检查 error 是否包含 errors 数组
    if (
      error?.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      // 获取 errors 数组的第一个元素作为错误消息
      errorMessage = error.response.data.errors[0] || "未知错误";
    } else {
      // 兼容 message 字段
      errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
    }

    ElMessage.error(errorMessage);
  }
};
// 注销账号
// 注销账号
const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      "您确定要注销账号吗？您的所有资源将被删除。请谨慎操作。",
      "确认注销",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const userId = userStore.user.id;
    // 删除用户所有图片
    await userStore.deleteAllUserImages();

    // 直接删除用户资源，
    await axiosConfig.delete("/users/resources", {
      data: { userId },
    });

    // 直接删除用户评论，
    await axiosConfig.delete(`/admin/comment/user/${userStore.user.id}`);
    await axiosConfig.delete(`/auth/devices/${userStore.user.id}`);
    // 删除账户
    const response = await axiosConfig.delete("/users/delete");

    // 删除主题
    localStorage.removeItem(`theme-${uuid.value}`);

    // 删除头像
    if (
      avatar.value &&
      !avatar.value.includes(
        "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png"
      )
    ) {
      await deleteOldAvatar(false);
    }

    // 清除 cookie 和缓存
    Cookies.remove("ds-token");
    themeStore.clearUserTheme();
    localStorage.removeItem("reportedMessages");

    ElMessage.success(response.data.message);
    router.push({ name: "login/index" });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
};
const fetchLikedArticles = async () => {
  try {
    if (!userStore.user.id) {
      ElMessage.error("用户ID获取失败");
      return;
    }
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
  router.push({ name: "login/index" });
};
onMounted(() => {
  fetchUserInfo().then(() => {
    fetchLikedArticles();
    getAllUsers();
    userStore.loadUser();
  });
});
defineExpose({
  deleteAccount,
});
</script>
<style lang="less" scoped>
@import "../../base-ui/setting.less";
</style>
