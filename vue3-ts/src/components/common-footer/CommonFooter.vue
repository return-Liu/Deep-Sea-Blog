<template>
  <div class="footer">
    <el-footer>
      <div class="footer-content">
        <div class="version">
          <span>版本号:</span>
          <span>1.0</span>
        </div>
        <div class="copyright">
          <span>Deep Sea {{ currentYear }} 版权所有</span>
        </div>
      </div>
    </el-footer>
  </div>
</template>
<script setup lang="ts" name="CommonFooter">
import { ref, onMounted } from "vue";
const currentYear = ref(new Date().getFullYear());
onMounted(() => {
  currentYear.value = new Date().getFullYear();
});
</script>
<style lang="less" scoped>
@import "../../assets/css/commonfooter.less";
</style>
