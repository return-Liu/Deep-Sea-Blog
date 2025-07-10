<template>
  <div>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal">
        <el-menu-item index="home">
          <router-link to="/home">首页</router-link>
        </el-menu-item>
        <el-menu-item index="articles">
          <router-link to="/articles">博客文章</router-link>
        </el-menu-item>
        <el-menu-item index="photographys">
          <router-link to="/photographys">摄影图库</router-link>
        </el-menu-item>
        <el-menu-item index="notes">
          <router-link to="/notes">随笔随记</router-link>
        </el-menu-item>
        <el-menu-item index="abouts-deep-sea">
          <router-link to="/abouts-deep-sea">关于 Deep Sea</router-link>
        </el-menu-item>
      </el-menu>
    </el-header>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Cookie from 'js-cookie'
import { Key } from '@element-plus/icons-vue'
const activeIndex = ref('home')
</script>
<style scoped lang="less">
@import '../../assets/css/common-header.less';
</style>
