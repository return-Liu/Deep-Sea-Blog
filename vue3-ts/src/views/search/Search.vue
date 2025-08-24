<template>
  <div class="search-container">
    <div class="search-bar">
      <el-input
        v-model="searchStore.searchQuery"
        placeholder="请输入搜索关键词"
        @keyup.enter="handleSearch"
        class="search-input"
      />
      <el-button type="primary" @click="handleSearch" class="search-button">
        搜索
      </el-button>
    </div>
    <div class="search-type">
      <el-tabs v-model="searchType" class="search-tabs">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="博客文章" name="articles"></el-tab-pane>
        <el-tab-pane label="摄影作品" name="photography"></el-tab-pane>
        <el-tab-pane label="随笔随记" name="notes"></el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="results">
      <section v-for="(section, key) in sections" :key="key">
        <h3 class="section-title">{{ section.title }}</h3>
        <div v-if="section.items.length" class="result-grid">
          <ResultItem
            v-for="item in section.items"
            :key="item.id"
            :item="item"
            :keyword="keyword"
          />
        </div>
        <div v-else class="no-results">
          没有找到相关结果，请根据关键字来搜索
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axiosConfig from "../../utils/request";
import ResultItem from "./ResultItem.vue";
import { ElMessage } from "element-plus";
import { useUserStore } from "../../store/userStore";
import { useSearchStore } from "../../store/searchStore";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const keyword = computed(() => {
  return route.query.keyword as string;
});

// 使用 Pinia Store
const searchStore = useSearchStore();
const userStore = useUserStore();
const user = computed(() => userStore.user);

// 状态管理
const searchType = ref("all"); // 默认搜索全部
interface SearchResults {
  articles?: { list: any[] };
  photography?: { list: any[] };
  notes?: { list: any[] };
}

const results = ref<SearchResults | null>(null);
const loading = ref(false);
const error = ref("");
const userId = ref<number | null>(null);

onMounted(() => {
  userId.value = user.value?.id || null;
});

// 计算属性
const sections = computed(() => {
  if (!results.value) return [];

  let sectionsArray: { title: string; items: any[] }[] = [];

  if (searchType.value === "all") {
    sectionsArray = [
      { title: "博客文章", items: results.value.articles?.list || [] },
      { title: "随笔随记", items: results.value.notes?.list || [] },
      { title: "摄影作品", items: results.value.photography?.list || [] },
    ];
  } else if (searchType.value === "articles") {
    sectionsArray = [
      { title: "博客文章", items: results.value.articles?.list || [] },
    ];
  } else if (searchType.value === "photography") {
    sectionsArray = [
      { title: "摄影作品", items: results.value.photography?.list || [] },
    ];
  } else if (searchType.value === "notes") {
    sectionsArray = [
      { title: "随笔随记", items: results.value.notes?.list || [] },
    ];
  }

  return sectionsArray;
});

// 搜索处理
const handleSearch = async () => {
  const query = searchStore.searchQuery.trim();

  if (!query) {
    ElMessage.warning("请输入搜索关键词");
    results.value = null;
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const response = await axiosConfig.get("/search/search", {
      params: {
        keyword: query,
        type: searchType.value,
        userId: userId.value,
      },
    });

    results.value = response.data.data;
    router.push({
      name: "search",
      query: {
        keyword: query,
        type: searchType.value,
      },
    });
  } catch (error: any) {
    // 兼容 message 字段
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
@import "../../base-ui/search.less";
</style>
