<template>
  <div class="local-resources">
    <div class="local-resources-header">
      <h2>本地文件</h2>
      <p class="local-resources-description">
        Hi
        <span :style="{ color: user?.nicknameColor || '#000' }">
          {{ user?.nickname || "默认用户" }}
        </span>
        ，你可以在这里查看你的所有本地文件。
      </p>
    </div>
    <div class="local-resources-content">
      <div class="resource-tree-container">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          class="resource-tree"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span v-if="data.type === 'year' && data.count !== undefined">
                {{ node.label }} ({{ data.count }}个文件)
              </span>
              <span
                v-else-if="data.type === 'month' && data.count !== undefined"
              >
                {{ node.label }} ({{ data.count }}个文件)
              </span>
              <span v-else>{{ node.label }}</span>
            </div>
          </template>
        </el-tree>
      </div>
      <div class="resource-details-container">
        <div v-if="selectedNode" class="resource-details">
          <div v-if="selectedNode.type === 'file'" class="resource-item">
            <img
              v-lazy="selectedNode.image ?? ''"
              :alt="getFileName(selectedNode.image ?? '')"
              class="resource-image"
              @click="handleClick(selectedNode.image ?? '')"
            />
            <div class="resource-info">
              <p>{{ getFileName(selectedNode.image ?? "") }}</p>
              <p class="file-size">
                {{ formatFileSize(selectedNode.size ?? 0) }}
              </p>
              <p class="time">
                {{ formatDate(selectedNode.createdAt?.toString() ?? "") }}
              </p>
            </div>
          </div>
          <div v-else>
            <div
              v-for="item in selectedNode.children"
              :key="item.id"
              class="resource-item"
            >
              <img
                v-lazy="item.image ?? ''"
                :alt="getFileName(item.image ?? '')"
                class="resource-image"
                @click="handleClick(item.image ?? '')"
              />
              <div class="resource-info">
                <p>{{ getFileName(item.image ?? "") }}</p>
                <p class="file-size">{{ formatFileSize(item.size ?? 0) }}</p>
                <p class="time">
                  {{ formatDate(item.createdAt?.toString() ?? "") }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>请选择一个文件夹或文件以查看详细信息。</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="localResources">
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";
import { useResources } from "../../hooks/useResources";
const { formatFileSize, getFileName } = useResources();
import { type ResourceItem, type TreeNode } from "../../types/localresources";
const resources: ResourceItem[] = [];
const userStore = useUserStore();
const user = computed(() => userStore.user);
const treeData = ref<TreeNode[]>([]);
const totalSize = ref(0);
const userId = ref<number | null>(null);
userId.value = user.value?.id || null;

const defaultProps = {
  children: "children",
  label: "label",
};
function groupResourcesByDate(resources: ResourceItem[]): TreeNode[] {
  const yearMap = new Map<string, TreeNode>();
  resources.forEach((resource) => {
    const date = new Date(resource.date);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();
    // 处理年份节点
    if (!yearMap.has(year)) {
      yearMap.set(year, {
        id: `year-${year}`,
        label: `${year}年`,
        type: "year",
        children: [],
        count: 0,
        size: 0,
      });
    }
    const yearNode = yearMap.get(year)!;
    yearNode.count!++;
    yearNode.size! += resource.size;
    // 处理月份节点
    let monthNode = yearNode.children!.find((n) => n.label === `${month}月`);
    if (!monthNode) {
      monthNode = {
        id: `month-${year}-${month}`,
        label: `${month}月`,
        type: "month",
        children: [],
        count: 0,
        size: 0,
      };
      yearNode.children!.push(monthNode);
    }
    monthNode.count!++;
    monthNode.size! += resource.size;
    // 添加文件节点
    monthNode.children!.push({
      id: resource.id,
      label: getFileName(resource.image),
      type: "file",
      image: resource.image,
      size: resource.size,
      createdAt: resource.date,
    });
  });
  // 对年份节点的子节点（月份节点）进行排序
  yearMap.forEach((yearNode) => {
    console.log(yearNode);
    yearNode.children!.sort((a, b) => {
      const monthA = parseInt(a.label.slice(0, 2), 10);
      const monthB = parseInt(b.label.slice(0, 2), 10);
      return monthA - monthB;
    });
  });
  return Array.from(yearMap.values());
}
async function addEssay(currentPage: number = 1) {
  try {
    const limit = 9;
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
    // 处理文章数据
    const articles = responseArticles.data.data.articles;
    articles.forEach((article: any) => {
      if (article.userId === userId.value) {
        resources.push({
          id: article.id,
          name: article.name,
          image: article.image,
          size: article.size,
          date: article.createdAt,
        });
        totalSize.value += article.size;
      }
    });

    // 处理摄影数据
    const photography = responsePhotography.data.data.photography;
    photography.forEach((photo: any) => {
      if (photo.userId === userId.value) {
        resources.push({
          id: photo.id,
          name: photo.name,
          image: photo.image,
          size: photo.size,
          date: photo.createdAt,
        });
        totalSize.value += photo.size;
      }
    });

    // 处理笔记数据
    const notes = responseNotes.data.data.notes;
    notes.forEach((note: any) => {
      if (note.userId === userId.value) {
        resources.push({
          id: note.id,
          name: note.name,
          image: note.image,
          size: note.size,
          date: note.createdAt,
        });
        totalSize.value += note.size;
      }
    });
    // 生成树形结构
    const newTreeData = groupResourcesByDate(resources);
    if (currentPage === 1) {
      treeData.value = newTreeData;
    } else {
      treeData.value = [...treeData.value, ...newTreeData];
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      const responseData = error.response.data;
      if (responseData.errors) {
        responseData.errors.forEach((error: string) => {
          ElMessage.error(error);
        });
      }
    } else {
      ElMessage.error(error.message);
    }
  }
}

const handleClick = (url: string) => {
  window.open(url);
};
onMounted(() => {
  addEssay();
});
// 定义时间转换函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const selectedNode = ref<TreeNode | null>(null);
const handleNodeClick = (data: TreeNode) => {
  if (data.type === "file") {
    // 如果点击的是文件节点，显示单个文件
    selectedNode.value = data;
  } else if (data.type === "year") {
    // 如果点击的是年份节点，收集该年份下所有文件
    const allFiles: TreeNode[] = [];
    data.children?.forEach((month) => {
      if (month.children) {
        allFiles.push(...month.children);
      }
    });
    // 创建一个新的节点来显示所有文件
    selectedNode.value = {
      id: data.id,
      label: data.label,
      type: "year",
      children: allFiles,
      count: data.count,
      size: data.size,
    };
  } else if (data.type === "month") {
    // 如果点击的是月份节点，显示该月的文件
    selectedNode.value = data;
  }
};
</script>
<style scoped lang="less">
@import "../../base-ui/localresources.less";
</style>
