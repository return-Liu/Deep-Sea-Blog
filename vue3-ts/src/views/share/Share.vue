<template>
  <div class="share-container">
    <div class="profile-section">
      <div class="profile-info">
        <div class="avatar" @click="openAuthorProfile">
          <img
            v-if="user?.avatar || DEFAULT_AVATAR"
            v-lazy="userAvatarUrl"
            alt="头像"
            :title="`用户${user?.nickname || '默认用户'}的头像`"
            @error="handleAvatarError"
          />
        </div>
        <div class="user-info">
          <h2 :title="`用户${user?.nickname || '默认用户'}的昵称`">
            Hi
            <span
              :style="{
                color: user?.nicknameColor || '#000',
                fontWeight: 'bold',
              }"
            >
              {{ user?.nickname || "默认用户" }}
            </span>
          </h2>
          <p
            :title="`用户${user?.nickname || '默认用户'}的个性签名`"
            class="bio"
          >
            {{ user?.introduce }}
          </p>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="number">{{ articleTotal }}</span>
          <span class="label">博客文章</span>
        </div>
        <div class="stat-item">
          <span class="number">{{ photographyTotal }}</span>
          <span class="label">摄影图库</span>
        </div>
        <div class="stat-item">
          <span class="number">{{ noteTotal }}</span>
          <span class="label">随笔随记</span>
        </div>
      </div>
    </div>
    <div class="content-nav">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="changeTab(tab.id)"
      >
        <component :is="tab.icon" class="icon"></component>
        <span class="text">{{ tab.text }}</span>
      </div>
    </div>
    <div class="content-section" ref="contentSection">
      <div name="content-fade" tag="div" class="content-grid">
        <div
          v-for="item in currentContent"
          :key="item.id"
          @click="editContent(item)"
          class="content-card"
          @mouseenter="handleMouseEnter(item)"
          :title="`用户${user?.nickname || '默认用户'}的${
            contentTypeMap[item.type] || '个人分享'
          }`"
        >
          <div class="card-media">
            <img v-lazy="getItemImageUrl(item)" @error="handleImageError" />
            <div class="card-overlay">
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
          <div class="card-content">
            <template v-if="isSupportedContentType(item.type)">
              <h3 class="title">{{ getTitle(item) }}</h3>
              <p class="excerpt">{{ getContent(item) }}</p>
            </template>
            <div class="card-actions">
              <div class="left-actions">
                <span v-if="item.type === 'essay'" class="tag">{{
                  getLabel(item)
                }}</span>
              </div>
              <div class="right-actions">
                <button
                  v-if="item.type === 'essay'"
                  class="like-btn"
                  :title="getLikedStatus(item) ? '喜欢' : '取消喜欢'"
                  @click.stop="handleLike(item.id, getLikedStatus(item))"
                >
                  <HeartOutlined :class="{ liked: getLikedStatus(item) }" />
                  <span class="like-count">{{ getLikesCount(item) }}</span>
                </button>
                <button
                  v-if="item.type === 'essay'"
                  class="views-btn"
                  @click.stop
                >
                  <EyeOutlined />
                  <span class="views-count">浏览{{ item.views }}次</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentContent.length === 0" class="empty-state">
        <yk-empty
          :description="`暂无${getTabName(activeTab)}内容`"
          type="secondary"
        />
      </div>
      <div v-if="hasMoreContent" class="load-more">
        <p type="primary" @click="loadMore" :disabled="isLoading">加载更多</p>
      </div>
      <div v-else-if="currentContent.length > 0" class="load-more">
        <p>加载到底了</p>
      </div>
      <div v-else class="load-more">
        <p>没有更多内容</p>
      </div>
    </div>
    <div v-if="selectedContent" class="content-detail">
      <ContentDisplay
        :content-type="selectedContent.type"
        :content="selectedContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="Share">
import { ref, onMounted, watch, computed, defineExpose } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosConfig from "../../utils/request";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { YkEmpty } from "@yike-design/ui";
import { EyeOutlined, HeartOutlined } from "@ant-design/icons-vue";
import { apiUrl } from "../../config";
import BlogIcon from "../../components/icon/Blog.vue";
import PhotographyIcon from "../../components/icon/Photography.vue";
import NoteIcon from "../../components/icon/Note.vue";
import { ElMessage } from "element-plus";
import { type Article, type Photography, type Note } from "../../types/share";
import { useGeneral } from "../../hooks/usegeneral";
import { useUserStore } from "../../store/userStore";

// 常量定义
const DEFAULT_AVATAR =
  "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
const SUPPORTED_CONTENT_TYPES = ["essay", "photography", "notes"];
const CONTENT_TYPE_MAP = {
  notes: "随笔随记",
  photography: "摄影图库",
  essay: "博客文章",
};
const TABS = [
  { id: "essays", text: "博客文章", icon: BlogIcon },
  { id: "photographys", text: "摄影图库", icon: PhotographyIcon },
  { id: "notes", text: "随笔随记", icon: NoteIcon },
];
const LIMIT_PER_PAGE = 6;

// 组合式 API
const { isLoading, contentSection, loadMore, currentPage } = useGeneral();
const userStore = useUserStore();
const { openAuthorProfile } = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();
const router = useRouter();

// 引用定义
const selectedContent = ref<Article | Photography | Note | null>(null);
const essay = ref<Article[]>([]);
const photography = ref<Photography[]>([]);
const notes = ref<Note[]>([]);
const articleTotal = ref(0);
const photographyTotal = ref(0);
const noteTotal = ref(0);
const userId = ref<number | null>(user.value?.id || null);
const activeTab = ref<string>(
  Array.isArray(route.params.tab)
    ? route.params.tab[0]
    : route.params.tab || "essays"
);
const contentTypeMap = ref<any>(CONTENT_TYPE_MAP);
const tabs = TABS;

// 计算属性
const currentContent = computed(() => {
  let content: any[] = [];
  if (activeTab.value === "essays") {
    content = [...essay.value];
  } else if (activeTab.value === "photographys") {
    content = [...photography.value];
  } else if (activeTab.value === "notes") {
    content = [...notes.value];
  }
  return content.slice(0, currentPage.value * LIMIT_PER_PAGE);
});

const hasMoreContent = computed(() => {
  const totals = {
    essays: articleTotal.value,
    photographys: photographyTotal.value,
    notes: noteTotal.value,
  };
  return (
    currentContent.value.length <
    (totals[activeTab.value as keyof typeof totals] || 0)
  );
});

const userAvatarUrl = computed(() => {
  if (!user.value?.avatar) return DEFAULT_AVATAR;

  // 如果已经是完整URL，直接返回
  if (user.value.avatar.startsWith("http")) {
    return user.value.avatar;
  }

  // 否则构造OSS URL（假设OSS允许公开读）
  return `http://deep-seas-oss-cn-beijing.aliyuncs.com/${user.value.avatar}`;
});

// 暴露方法
defineExpose({
  fetchData,
});

// 工具函数
const isSupportedContentType = (type: string) => {
  return SUPPORTED_CONTENT_TYPES.includes(type);
};

const getTabName = (tab: string) => {
  return tabs.find((t) => t.id === tab)?.text || "";
};

const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

// 图片处理函数
const getItemImageUrl = (item: any): string => {
  if (!item.image) return DEFAULT_AVATAR;

  // 如果已经是完整URL，直接返回
  if (item.image.startsWith("http")) {
    return item.image;
  }

  // 否则构造OSS URL（假设OSS允许公开读）
  return `http://deep-seas-oss-cn-beijing.aliyuncs.com/${item.image}`;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = DEFAULT_AVATAR;
};

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = DEFAULT_AVATAR;
};

// 内容处理函数
const getTitle = (item: any) => {
  return activeTab.value === "essays"
    ? (item as Article).title
    : (item as Note).title;
};

const getContent = (item: any): string => {
  let content = "";
  if (activeTab.value === "essays") {
    content = (item as Article).content;
  } else if (activeTab.value === "photographys") {
    content = (item as Photography).content;
  } else if (activeTab.value === "notes") {
    content = (item as Note).content;
  }
  return content || "";
};

const getLabel = (item: any) => {
  return (item as Article).label;
};

const getLikedStatus = (item: any) => {
  return (item as Article).isLiked;
};

const getLikesCount = (item: any) => {
  return (item as Article).likesCount;
};

// 数据获取
async function fetchData(currentPageNum: number = 1) {
  try {
    const [responseArticles, responsePhotography, responseNotes] =
      await Promise.all([
        axiosConfig.get("/admin/article", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: currentPageNum,
          },
        }),
        axiosConfig.get("/admin/photography", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: currentPageNum,
          },
        }),
        axiosConfig.get("/admin/note", {
          params: {
            userId: userId.value,
            limit: LIMIT_PER_PAGE,
            currentPage: currentPageNum,
          },
        }),
      ]);

    // 更新数据
    if (currentPageNum === 1) {
      essay.value = responseArticles.data.data.articles.map(
        (item: Article) => ({
          ...item,
          type: "essay",
          views: item.views || 0,
          isViewed: false,
          isLiked: item.isLiked ?? false,
          likesCount: item.likesCount ?? 0,
        })
      );

      photography.value = responsePhotography.data.data.photography.map(
        (item: Photography) => ({
          ...item,
          type: "photography",
        })
      );

      notes.value = responseNotes.data.data.notes.map((item: Note) => ({
        ...item,
        type: "notes",
      }));
    }

    // 更新总数
    articleTotal.value = responseArticles.data.data.pagination.total;
    photographyTotal.value = responsePhotography.data.data.pagination.total;
    noteTotal.value = responseNotes.data.data.pagination.total;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
}

// 事件处理
const handleMouseEnter = async (item: any) => {
  if (item.type === "essay" && !item.isViewed) {
    try {
      await axiosConfig.post(`/admin/article/views/${item.id}`);
      const index = essay.value.findIndex((article) => article.id === item.id);
      if (index !== -1) {
        essay.value[index].views += 1;
        essay.value[index].isViewed = true;
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "未知错误";
      ElMessage.error(errorMessage);
    }
  }
};

const editContent = (content: Article | Photography | Note) => {
  if (!isSupportedContentType(content.type)) {
    ElMessage.error("不支持的内容类型");
    return;
  }

  const routeData = router.resolve({
    name: "overview",
    query: {
      id: String(content.id),
      type: content.type,
    },
  });

  window.open(routeData.href, `content_${content.type}`);
};

const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  const query = route.query.id ? { id: route.query.id } : {};
  router.push({
    name: "share",
    params: { tab: tabId },
    query,
  });
};

// 点赞处理
async function handleLike(id: number, isLiked: boolean) {
  try {
    const response = await axiosConfig.post(`/admin/likes/like`, {
      articleId: id,
      userId: userId.value,
    });

    const index = essay.value.findIndex((article: any) => article.id === id);
    if (index !== -1) {
      essay.value[index].isLiked = !isLiked;
      essay.value[index].likesCount = response.data.likeCount;
    }

    fetchData();
    ElMessage.success(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  }
}

// 生命周期钩子
onMounted(async () => {
  await fetchData();

  const contentId = route.query.id;
  if (contentId) {
    let content;
    if (activeTab.value === "essays") {
      content = essay.value.find((item) => item.id.toString() === contentId);
    } else if (activeTab.value === "photographys") {
      content = photography.value.find(
        (item) => item.id.toString() === contentId
      );
    } else if (activeTab.value === "notes") {
      content = notes.value.find((item) => item.id.toString() === contentId);
    }

    if (content) {
      editContent(content);
    }
  }
});

// 监听器
watch(activeTab, () => {
  fetchData();
});

watch(
  () => route.params.tab,
  (newTab) => {
    activeTab.value = Array.isArray(newTab) ? newTab[0] : newTab || "essays";
  }
);
</script>

<style scoped lang="less">
@import "../../base-ui/share.less";
</style>
