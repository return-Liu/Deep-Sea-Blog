<template>
  <div class="download">
    <h2>下载</h2>
    <p>您可以从以下链接下载我们的最新版本：</p>
    <p><strong>版本:</strong> {{ version }}</p>
    <p><strong>系统要求:</strong> {{ systemRequirements }}</p>
    <a :href="downloadLink" class="download-link" @click="handleDownload">
      <span v-if="!isDownloading">下载文件</span>
      <span v-else>下载中...</span>
    </a>
    <p v-if="downloadMessage" class="download-message">{{ downloadMessage }}</p>
    <ul v-if="downloadHistory.length" class="download-history">
      <li v-for="(entry, index) in downloadHistory" :key="index">
        {{ entry }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" name="DownLoad">
import { ref } from "vue";

const downloadLink = ref("");
const version = ref("1.0");
const systemRequirements = ref("Windows 10+, macOS 10.15+, Linux");
const isDownloading = ref(false);
const downloadMessage = ref("");
const downloadHistory = ref<string[]>([]);

const handleDownload = () => {
  if (isDownloading.value) return;

  isDownloading.value = true;
  downloadMessage.value = "下载开始...";

  // Simulate download process
  setTimeout(() => {
    isDownloading.value = false;
    downloadMessage.value = "下载完成！";
    downloadHistory.value.push(`下载于 ${new Date().toLocaleString()}`);
  }, 3000);
};
</script>

<style lang="less" scoped>
@import "../../base-ui/download.less";
</style>
