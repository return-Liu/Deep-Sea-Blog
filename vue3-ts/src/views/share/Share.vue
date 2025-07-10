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
          class="content-card"
          @click="editContent(item)"
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
    <el-drawer
      v-model="drawerVisible"
      :direction="direction"
      :before-close="handleCloseDrawer"
      :close-on-click-modal="false"
    >
      <EditOutlined style="position: fixed; top: 23px; color: skyblue" />
      <el-form :model="editingContent" label-width="80px">
        <el-form-item
          label="标题"
          v-if="
            editingContent.type === 'essay' || editingContent.type === 'notes'
          "
        >
          <el-input v-model="editingContent.title" />
        </el-form-item>
        <el-form-item
          label="内容"
          v-if="
            editingContent.type === 'essay' ||
            editingContent.type === 'photography' ||
            editingContent.type === 'notes'
          "
        >
          <el-input v-model="editingContent.content" type="textarea" />
        </el-form-item>
        <el-form-item label="图库">
          <el-upload
            class="article-uploader"
            :action="`${apiUrl}/admin/upload`"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            method="post"
            :data="{ userId: userId }"
            name="image"
            :auto-upload="false"
            ref="uploadRef"
            @change="handleChange"
          >
            <div class="upload-container">
              <img
                v-if="editingContent.image"
                v-lazy="editingContent.image"
                class="uploaded-image"
              />
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span class="upload-text">点击上传图片</span>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="标签" v-if="editingContent.type === 'essay'">
          <el-input v-model="editingContent.label"></el-input>
        </el-form-item>
        <el-form-item>
          <DeleteOutlined
            type="danger"
            @click="handleDeleteContent"
            style="
              width: 100%;
              display: flex;
              justify-content: flex-end;
              color: #b04343;
            "
          />
        </el-form-item>
        <el-form-item style="position: fixed; bottom: 0; right: 10px">
          <div
            type="primary"
            class="avatar-upload"
            @click="saveContent"
            style="right: 20px"
          >
            <el-icon><SuccessFilled /></el-icon>
            <span>保存</span>
          </div>
          <div
            v-if="showUploadButton"
            class="avatar-upload"
            @click="submitUpload"
          >
            <el-icon><Upload /></el-icon>
            <span>上传</span>
          </div>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>
<script setup lang="ts" name="Share">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosConfig from "../../utils/request";
import { YkEmpty } from "@yike-design/ui";
import { EyeOutlined } from "@ant-design/icons-vue";
import { apiUrl } from "../../config";
import { ElMessage, ElInput, ElForm, ElFormItem } from "element-plus";
import {
  HeartOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import BlogIcon from "../../components/icon/Blog.vue";
import PhotographyIcon from "../../components/icon/Photography.vue";
import NoteIcon from "../../components/icon/Note.vue";
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
let drawerVisible = ref(false);
let direction = ref<"ltr" | "rtl" | "ttb" | "btt">("rtl");
let editingContent = ref<any>({
  size: 0,
});
let originalContent = ref<any>({}); // 记录原始内容
let currentContentType = ref<string>("");
userId.value = user.value?.id || null;
const viewAvatar = () => {
  if (user.value?.avatar) {
    window.open(user.value.avatar, "_blank");
  } else {
    ElMessage.error("头像未设置");
  }
};

// 检测内容是否被修改
const isContentModified = () => {
  return (
    editingContent.value.title !== originalContent.value.title ||
    editingContent.value.content !== originalContent.value.content ||
    editingContent.value.label !== originalContent.value.label ||
    editingContent.value.image !== originalContent.value.image
  );
};

const submitUpload = () => {
  uploadRef.value.submit();
};
const handleChange = (file: File, fileList: File[]) => {
  showUploadButton.value = fileList.length > 0;
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
// 修改编辑方法
const editContent = (content: any) => {
  editingContent.value = { ...content };
  originalContent.value = { ...content }; // 记录原始内容
  currentContentType.value = content.type; // 使用内容自身的类型
  drawerVisible.value = true;
  router.push({
    name: "share",
    params: { tab: activeTab.value },
    query: { id: content.id.toString() },
  });
};
// 保存逻辑优化
async function saveContent() {
  try {
    if (!isContentModified()) {
      ElMessage.info("没有发现任何更改，请修改后再来保存");
      drawerVisible.value = false;
      return;
    }

    const { id, type, size } = editingContent.value;
    let endpoint = "";
    let data: any = {};

    switch (type) {
      case "essay":
        endpoint = `/admin/article/${id}`;
        data = {
          title: editingContent.value.title,
          content: editingContent.value.content,
          label: editingContent.value.label,
          image: editingContent.value.image,
          size: size,
        };
        break;
      case "photography":
        endpoint = `/admin/photography/${id}`;
        data = {
          image: editingContent.value.image,
          content: editingContent.value.content,
          size: size,
        };
        break;
      case "notes":
        endpoint = `/admin/note/${id}`;
        data = {
          title: editingContent.value.title,
          content: editingContent.value.content,
          image: editingContent.value.image,
          size: size,
        };
        break;
    }
    await axiosConfig.put(endpoint, data);
    ElMessage.success("更新成功");
    // 提交上传
    submitUpload();
    fetchData();
    drawerVisible.value = false;
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败，请检查数据格式");
  }
}
const handleCloseDrawer = async (done: () => void) => {
  drawerVisible.value = false;
  showUploadButton.value = false;
  router.push({
    name: "share",
    params: { tab: activeTab.value },
  });
  done();
};
const handleDeleteContent = () => {
  const id = editingContent.value?.id;
  if (id !== undefined) {
    deleteContent(id);
  } else {
    ElMessage.error("无法获取内容 ID，请重试");
  }
};
let deleteContent = async (id: number) => {
  try {
    let endpoint = "";
    // 根据实际内容类型判断
    switch (editingContent.value.type) {
      case "essay":
        endpoint = `/admin/article/${id}`;
        break;
      case "photography":
        endpoint = `/admin/photography/${id}`;
        break;
      case "notes":
        endpoint = `/admin/note/${id}`;
        break;
    }

    // 修正图片删除路径
    if (editingContent.value.image) {
      const imageName = editingContent.value.image.split("/").pop();
      await axiosConfig.delete(`/admin/upload/image/${imageName}`);
    }
    await axiosConfig.delete(endpoint);
    fetchData();
    ElMessage.success("删除成功");
    drawerVisible.value = false;
  } catch (error) {
    console.error("删除失败", error);
    ElMessage.error("删除失败，请稍后再试");
  }
};
const beforeUpload = (file: File) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const isAllowedType = allowedTypes.includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isAllowedType) {
    ElMessage.error("上传图片只能是 JPG 或 PNG 或 WEBP 或 GIF 格式!");
  }
  if (!isLt2M) {
    ElMessage.error("上传图片大小不能超过 2MB!");
  }
  // 检查 userId 是否存在
  if (!userId.value) {
    ElMessage.error("ID未找到，请重新登录");
    return false;
  }
  editingContent.value.size = file.size;
  // 上传新图片时，删除旧图片
  if (editingContent.value.image) {
    const oldImagePath = editingContent.value.image;
    const oldImageName = oldImagePath.split("/").pop();
    axiosConfig.delete(`${apiUrl}/admin/upload/image/${oldImageName}`);
    ElMessage.error("旧图片已删除,已重新上传新图片");
  }
  return isAllowedType && isLt2M;
};
const handleSuccess = (response: any, file: File) => {
  editingContent.value.image = `${apiUrl}/image/${response.data.image}`;
  ElMessage.success("图片上传成功");
  // 清空文件列表
  uploadRef.value.clearFiles();

  // 隐藏上传按钮
  showUploadButton.value = false;
};
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
