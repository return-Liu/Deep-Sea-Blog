<template>
  <el-dialog
    v-model="visible"
    title="赞助 Deep Sea"
    :show-close="false"
    width="420px"
    align-center
  >
    <img :src="qrCodeImg" alt="赞助二维码" class="qrcode-image" />
    <template #footer>
      <el-button @click="close">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
  qrCodeImg: string;
}>();

const visible = ref(true);

const close = () => {
  visible.value = false;
};
</script>

<style scoped>
.qrcode-image {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}
</style>
