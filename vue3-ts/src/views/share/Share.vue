<template>
  <div class="share-container">
    <div class="profile-section">
      <div class="profile-info">
        <div class="avatar" @click="viewAvatar">
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
        <!-- 动态渲染图标组件   -->
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
            <img v-lazy="item.image" />
            <div class="card-overlay">
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
          <div class="card-content">
            <template
              v-if="
                item.type === 'photography' ||
                item.type === 'notes' ||
                item.type === 'essay'
              "
            >
              <h3 class="title">{{ getTitle(item) }}</h3>
              <p class="excerpt">{{ getContent(item) }}</p>
            </template>
            <div class="card-actions">
              <span v-if="item.type === 'essay'" class="tag">{{
                getLabel(item)
              }}</span>
              <div class="action-buttons">
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
      <div
        v-if="
          currentContent.length <
          (activeTab === 'essays'
            ? articleTotal
            : activeTab === 'photographys'
            ? photographyTotal
            : activeTab === 'notes'
            ? noteTotal
            : 0)
        "
        class="load-more"
      >
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
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosConfig from "../../utils/request";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { YkEmpty } from "@yike-design/ui";
import { EyeOutlined } from "@ant-design/icons-vue";
import { apiUrl } from "../../config";
import BlogIcon from "../../components/icon/Blog.vue";
import PhotographyIcon from "../../components/icon/Photography.vue";
import NoteIcon from "../../components/icon/Note.vue";
import { ElMessage } from "element-plus";
const tabs = [
  { id: "essays", text: "博客文章", icon: BlogIcon },
  { id: "photographys", text: "摄影图库", icon: PhotographyIcon },
  { id: "notes", text: "随笔随记", icon: NoteIcon },
];
import { useGeneral } from "../../hooks/usegeneral";
import { useUserStore } from "../../store/userStore";
const { isLoading, contentSection, loadMore, currentPage } = useGeneral();
const userStore = useUserStore();
const user = computed(() => userStore.user);
const route = useRoute();
const router = useRouter();
const selectedContent = ref<Article | Photography | Note | null>(null);
interface Article {
  id: number;
  title: string;
  content: string;
  label: string;
  image: string;
  createdAt: string;
  isLiked: boolean;
  likesCount: number;
  views: number; // 添加浏览数量字段
  userId: number;
  type: string; // 添加类型字段
  isViewed: boolean; // 新增属性
}
interface Photography {
  id: number;
  image: string;
  userId: number;
  createdAt: string;
  content: string;
  type: string; // 添加类型字段
}
interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
  image: string;
  type: string;
}
const uploadRef = ref<any>(null);
let showUploadButton = ref(false);
let essay = ref<Article[]>([]);
let photography = ref<Photography[]>([]);
let notes = ref<Note[]>([]);
const articleTotal = ref(0);
const photographyTotal = ref(0);
const noteTotal = ref(0);
let userId = ref<number | null>(null);
userId.value = user.value?.id || null;
const viewAvatar = () => {
  if (user.value?.avatar) {
    window.open(user.value.avatar, "_blank");
  } else {
    ElMessage.error("头像未设置");
  }
};

// 获取文章、摄影、随记数据
async function fetchData(currentPage: number = 1) {
  try {
    const limit = 6; // 每次加载6条数据
    const [responseArticles, responsePhotography, responseNotes] =
      await Promise.all([
        axiosConfig.get("/admin/article", {
          params: { userId: userId.value, limit, currentPage },
        }),
        axiosConfig.get("/admin/photography", {
          params: { userId: userId.value, limit, currentPage },
        }),
        axiosConfig.get("/admin/note", {
          params: { userId: userId.value, limit, currentPage },
        }),
      ]);
    // 更新数据
    if (currentPage === 1) {
      essay.value = responseArticles.data.data.articles.map(
        (item: Article) => ({
          ...item,
          type: "essay",
          views: item.views || 0,
          isViewed: false,
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
  } catch (error) {
    console.error("获取数据失败:", error);
    ElMessage.error("获取数据失败，请稍后再试");
  }
}
const handleMouseEnter = async (item: any) => {
  // 只处理文章类型且未被浏览过的情况
  if (item.type === "essay" && !item.isViewed) {
    try {
      // 更新后端浏览量
      await axiosConfig.post(`/admin/article/views/${item.id}`);
      // 更新前端显示
      const index = essay.value.findIndex((article) => article.id === item.id);
      if (index !== -1) {
        essay.value[index].views += 1;
        essay.value[index].isViewed = true;
      }
    } catch (error) {
      console.error("更新浏览量失败:", error);
    }
  }
};
const editContent = (content: Article | Photography | Note) => {
  const validTypes = ["essay", "photography", "notes"];
  if (!validTypes.includes(content.type)) {
    ElMessage.error("不支持的内容类型");
    return;
  }

  router.push({
    name: "overview",
    query: {
      id: String(content.id),
      type: content.type,
    },
  });
};
onMounted(async () => {
  await fetchData();

  // 检查 URL 查询参数中是否包含 id
  const contentId = route.query.id;
  if (contentId) {
    // 根据 id 查找对应内容
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
    // 如果找到内容,打开编辑抽屉
    if (content) {
      editContent(content);
    }
  }
});
const contentTypeMap = ref<any>({
  notes: "随笔随记",
  photography: "摄影图库",
  essay: "博客文章",
});
// 计算当前页内容
const currentContent = computed(() => {
  let content: any[] = [];
  if (activeTab.value === "essays") {
    content = [...essay.value];
  } else if (activeTab.value === "photographys") {
    content = [...photography.value];
  } else if (activeTab.value === "notes") {
    content = [...notes.value];
  }
  return content.slice(0, currentPage.value * 6); // 每次显示6条数据
});
// 处理标签切换对应的路由
const changeTab = (tabId: string) => {
  activeTab.value = tabId;
  const query = route.query.id ? { id: route.query.id } : {};
  router.push({
    name: "share",
    params: { tab: tabId },
    query,
  });
};
// 处理标签切换默认为essay
const activeTab = ref<string>(
  Array.isArray(route.params.tab)
    ? route.params.tab[0]
    : route.params.tab || "essays"
);

// 监听标签切换 并重新加载数据
watch(activeTab, () => {
  fetchData();
});
// 监听路由变化
watch(
  () => route.params.tab,
  (newTab) => {
    activeTab.value = Array.isArray(newTab) ? newTab[0] : newTab || "essays";
  }
);
// 格式化日期
const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};
// 点赞处理函数
async function handleLike(id: number, isLiked: boolean) {
  try {
    const response = await axiosConfig.post(`/admin/likes/like`, {
      articleId: id,
      userId: userId.value,
    });

    // 更新点赞状态
    const index = essay.value.findIndex((article: any) => article.id === id);
    if (index !== -1) {
      essay.value[index].isLiked = !isLiked;
      essay.value[index].likesCount = response.data.likeCount;
    }
    ElMessage.success(response.data.message);
  } catch (error) {
    console.error("点赞/取消点赞失败", error);
    ElMessage.error("点赞/取消点赞失败，请稍后再试");
  }
}
// 获取标签名
const getTabName = (tab: string) => {
  return tabs.find((t) => t.id === tab)?.text || "";
};
// 获取标题 内容 标签
const getTitle = (item: any) => {
  return activeTab.value === "essay"
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
// 获取点赞状态
const getLikedStatus = (item: any) => {
  return (item as Article).isLiked;
};
// 获取点赞数量
const getLikesCount = (item: any) => {
  return (item as Article).likesCount;
};
</script>

<style scoped lang="less">
@import "../../base-ui/share.less";
</style>
