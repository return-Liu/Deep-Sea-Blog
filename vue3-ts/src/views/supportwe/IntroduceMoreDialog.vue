<template>
  <el-dialog
    v-model="visible"
    title="周期性赞助详情"
    :show-close="true"
    width="500px"
    align-center
  >
    <div class="content">
      <p>选择周期性赞助计划，每月自动捐助，享受以下专属回馈：</p>
      <ul>
        <li>名字上 GitHub 赞助名单</li>
        <li>官网 Logo 展示</li>
        <li>项目更新优先通知</li>
        <li>专属技术支持通道</li>
      </ul>
      <p>感谢您的持续支持，让我们走得更远！</p>
    </div>
    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

const visible = ref(true);

const close = () => {
  visible.value = false;
};

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
.content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 1em;
}
</style>
