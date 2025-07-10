<template>
  <div class="common-layout">
    <el-container direction="vertical">
      <common-header></common-header>
      <el-main>
        <router-view></router-view>
        <common-footer></common-footer>
      </el-main>
    </el-container>
  </div>
</template>
<script setup lang="ts" name="Main">
import CommonHeader from '../../components/common-header/CommonHeader.vue'
import CommonFooter from '../../components/common-footer/CommonFooter.vue'
</script>
