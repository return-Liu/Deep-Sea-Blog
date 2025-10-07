<template>
  <div>
    <el-header>
      <slot name="search-box" v-if="showSearchBox"></slot>
      <div class="avatar-box">
        <div class="email-box" title="系统通知" @click="viewMessage">
          <el-icon :size="30" :color="'#0078d4'">
            <Message />
          </el-icon>
        </div>
        <div class="avatar-img">
          <img
            @mouseenter="showInfoCard = true"
            v-if="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            v-lazy="
              user?.avatar ||
              'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
            "
            alt="头像"
            :title="`用户${user?.nickname || '默认用户'}的头像`"
          />
          <div
            :title="`用户${user?.nickname || '默认用户'}的信息面板`"
            class="info-card"
            v-if="showInfoCard"
            @mouseleave="showInfoCard = false"
          >
            <div class="info-card-header">
              <div class="info-card-avatar" @click="viewAvatar">
                <img
                  v-if="
                    user?.avatar ||
                    'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                  "
                  v-lazy="
                    user?.avatar ||
                    'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
                  "
                  alt="头像"
                  :title="`用户${user?.nickname || '默认用户'}的头像`"
                />
              </div>
              <div
                class="info-card-name"
                :title="`用户${user?.nickname || '默认用户'}的昵称`"
                :style="{ color: user?.nicknameColor || '#000' }"
              >
                {{ user?.nickname }}
              </div>
            </div>
            <div class="info-card-content">
              <div class="info-card-item">
                <p
                  @click="changeSetting"
                  :class="{
                    'current-page': $route.path === '/setting/personals',
                  }"
                >
                  我的资料
                </p>
                <span></span>
                <p
                  @click="viewAccountSecurity"
                  :class="{
                    'current-page': $route.path === '/setting/securitys',
                  }"
                >
                  账号安全
                </p>
                <span></span>
                <p
                  @click="goToLikedArticles"
                  :class="{ 'current-page': $route.path === '/setting/likes' }"
                >
                  我的点赞
                </p>
                <span></span>
                <p
                  @click="openSettings"
                  :class="{ 'current-page': $route.path === '/setting/modes' }"
                >
                  模式选择
                </p>
                <span></span>
                <p
                  @click="superColorPalette"
                  :class="{
                    'current-page': $route.path === '/setting/languages',
                  }"
                >
                  多种语言
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-header>
    <el-drawer
      title="系统通知"
      v-model="drawerVisible"
      :direction="direction"
      :close-on-click-modal="false"
      :size="size"
    >
      <div class="drawer-content">
        <div
          v-for="(update, index) in updates"
          :key="index"
          class="update-item"
        >
          <div class="update-content">
            <p class="update-title">
              {{ update.title }}
            </p>
            <p class="update-description">{{ update.content }}</p>
            <p class="update-time-text">
              <el-icon :size="16" :color="'#909399'">
                <Clock />
              </el-icon>
              更新时间: {{ update.formattedCreatedAt }}
            </p>
            <!-- 查看详情 -->
            <p class="view-details-container">
              <span class="view-details" @click="() => viewsystem(update.id)"
                >查看详情</span
              >
            </p>
          </div>
        </div>
      </div>
      <el-button
        type="primary"
        class="drawer-close-button"
        icon="el-icon-plus"
        @click="showDialog = true"
        v-if="user?.id === 4"
      >
        <p>+</p>
      </el-button>
    </el-drawer>
    <el-dialog title="新增更新信息" v-model="showDialog" width="50%">
      <el-form :model="newUpdate" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="newUpdate.title"></el-input>
        </el-form-item>
        <el-form-item label="更新内容">
          <el-input type="textarea" v-model="newUpdate.content"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addUpdate">新增</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="CommonHeader">
import useHeader from "../../hooks/useHeader";
import { defineProps } from "vue";
import { Clock } from "@element-plus/icons-vue";

// 使用插槽来显示搜索框 以便在不同的路由下显示不同的搜索框
defineProps({
  showSearchBox: {
    type: Boolean,
    default: false,
  },
});

const {
  Message,
  openSettings,
  goToLikedArticles,
  handleInput,
  changeSetting,
  viewAccountSecurity,
  viewMessage,
  direction,
  size,
  addUpdate,
  showDialog,
  showInfoCard,
  newUpdate,
  user,
  drawerVisible,
  updates,
  superColorPalette,
  viewsystem,
  viewAvatar,
} = useHeader();
</script>

<style lang="less" scoped>
@import "../../assets/css/commonheader.less";
</style>
