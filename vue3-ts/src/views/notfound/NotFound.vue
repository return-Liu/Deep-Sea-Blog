<template>
  <el-empty :description="notfound" />
</template>
<script setup lang="ts" name="NotFound">
import { ref } from "vue";
const notfound = ref("404 页面走丢了 😢");
</script>
<style lang="less" scoped>
.el-empty {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
