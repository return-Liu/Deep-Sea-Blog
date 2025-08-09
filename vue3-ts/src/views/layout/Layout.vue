<template>
  <div class="common-layout">
    <el-container style="height: 100vh">
      <common-aside></common-aside>
      <el-container direction="vertical">
        <common-header
          :showSearchBox="route.name === 'home' || route.name === 'share'"
        >
          <!-- 只在合适的位置展示搜索框  -->
          <template #search-box>
            <div class="search-box">
              <div class="search-input">
                <input
                  type="text"
                  class="search-input-text"
                  @input="handleInput"
                  @focus="handleFocus"
                  @blur="handleBlur"
                  @mouseenter="handleMouseEnter"
                  @mouseleave="handleMouseLeave"
                  v-model="searchStore.searchQuery"
                  @keyup.enter="handleSearch"
                  :placeholder="
                    route.name === 'share'
                      ? '请输入博客文章或摄影图库或随笔随记关键字进行搜索'
                      : ''
                  "
                />
                <div class="scrolling-text" v-show="!searchStore.searchQuery">
                  <el-carousel
                    direction="vertical"
                    :autoplay="!isScrollingPaused"
                    :interval="7000"
                  >
                    <el-carousel-item v-for="item in text" :key="item.name">
                      <h3 class="carousel-text" v-if="route.name === 'home'">
                        {{ item.name }}
                      </h3>
                    </el-carousel-item>
                  </el-carousel>
                </div>
              </div>
              <div class="search-icon">
                <el-icon :size="15" :color="'#c3cfe2'">
                  <search />
                </el-icon>
              </div>
            </div>
          </template>
        </common-header>
        <el-main>
          <router-view></router-view>
          <common-footer></common-footer>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script setup lang="ts" name="Main">
import { useRoute } from "vue-router";
import CommonAside from "../../components/common-aside/CommonAside.vue";
import CommonHeader from "../../components/common-header/CommonHeader.vue";
import CommonFooter from "../../components/common-footer/CommonFooter.vue";
import useHeader from "../../hooks/useHeader";
const route = useRoute();
const {
  Search,
  isSearchActive,
  searchStore,
  isScrollingPaused,
  text,

  handleInput,
  handleFocus,
  handleBlur,
  handleMouseEnter,
  handleMouseLeave,
  handleSearch,
} = useHeader();
</script>
<style lang="less" scoped>
@import "../../base-ui/layout.less";
</style>
