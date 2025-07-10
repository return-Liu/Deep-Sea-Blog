<template>
  <div class="result-item">
    <div class="result-image">
      <img :src="item.image" :alt="item.title" class="result-image" />
    </div>
    <div class="result-details">
      <h4 class="result-title" v-if="item.title">
        <span v-html="highlight(item.title)"></span>
      </h4>
      <h4 class="result-content" v-if="item.content">
        <span v-html="highlight(item.content)"></span>
      </h4>
      <p class="result-label" v-if="item.label">
        <span v-html="highlight(item.label)"></span>
      </p>
      <p class="result-date">{{ formatDate(item.createdAt) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from "vue";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

const props = defineProps<{
  item: {
    id: number;
    title?: string;
    label?: string;
    image: string;
    content: string;
    createdAt: string;
  };
  keyword: string;
}>();

const formatDate = (date: string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

// 添加正则转义函数
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const highlight = computed(() => {
  const keyword = props.keyword?.toLowerCase() || "";
  const escapedKeyword = escapeRegExp(keyword);
  return (text: string) => {
    if (!escapedKeyword) return text;
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    return text.replace(regex, "<span class='highlight'>$1</span>");
  };
});
</script>

<style lang="less" scoped>
@import "../../base-ui/resultItem.less";
:deep(.highlight) {
  color: red;
  font-weight: bold;
}
</style>
