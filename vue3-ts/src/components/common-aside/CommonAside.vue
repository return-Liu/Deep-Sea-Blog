<template>
  <el-aside
    :style="{ width: isCollapsed ? '64px' : '200px' }"
    class="common-aside"
  >
    <h2
      class="common-aside-logo"
      :style="{ display: isCollapsed ? 'none' : 'block' }"
    >
      {{ $t("commonaside.home.logo") }}
    </h2>
    <el-menu
      :router="true"
      :default-active="route.fullPath"
      :collapse-transition="false"
      :collapse="isCollapsed"
    >
      <el-tooltip :content="$t('commonaside.home.home')" placement="right">
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <router-link to="/home">{{
            $t("commonaside.home.home")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.localResources')"
        placement="right"
      >
        <el-menu-item index="/localresources">
          <el-icon><Picture /></el-icon>
          <router-link to="/localresources">{{
            $t("commonaside.home.localResources")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.personalShare')"
        placement="right"
      >
        <el-menu-item index="/share/essays">
          <el-icon><Share /></el-icon>
          <router-link to="/share/essays">{{
            $t("commonaside.home.personalShare")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.momentInTime')"
        placement="right"
      >
        <el-menu-item index="/messagewall/messages?category=全部">
          <el-icon><CameraFilled /></el-icon>
          <router-link to="/messagewall/messages?category=全部">{{
            $t("commonaside.home.momentInTime")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip :content="$t('commonaside.home.photo')" placement="right">
        <el-menu-item index="/photowall/photos?category=自然风光">
          <el-icon><PictureFilled /></el-icon>
          <router-link to="/photowall/photos?category=自然风光">{{
            $t("commonaside.home.photo")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.suggestions')"
        placement="right"
      >
        <el-menu-item index="/suggestionsfeedback">
          <el-icon><EditPen /></el-icon>
          <router-link to="/suggestions">{{
            $t("commonaside.home.suggestions")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.suggestionsList')"
        placement="right"
      >
        <el-menu-item index="/reportresultscenter">
          <el-icon><Calendar /></el-icon>
          <router-link to="/reportresultscenter">
            {{ $t("commonaside.home.reportresultscenter") }}
          </router-link>
        </el-menu-item>
      </el-tooltip>
      <el-tooltip
        :content="$t('commonaside.home.reportresultscenter')"
        placement="right"
      >
        <el-menu-item index="/securitycenter">
          <el-icon><Tools /></el-icon>
          <router-link to="/securitycenter">{{
            $t("commonaside.home.securitycenter")
          }}</router-link>
        </el-menu-item>
      </el-tooltip>
    </el-menu>
    <el-tooltip
      :content="
        isCollapsed
          ? $t('commonaside.home.expand')
          : $t('commonaside.home.collapse')
      "
      placement="right"
    >
      <div class="shrink" @click="toggleCollapse" v-show="showTitle">
        <el-icon>
          <Right v-if="isCollapsed" />
          <Back v-else />
        </el-icon>
      </div>
    </el-tooltip>
  </el-aside>
</template>
<script setup lang="ts" name="CommonAside">
import useAside from "../../hooks/useAside";
import { useI18n } from "vue-i18n";
// 省略其他导入
const { t } = useI18n();
const {
  isCollapsed,
  toggleCollapse,
  HomeFilled,
  Share,
  ChatDotRound,
  FolderOpened,
  ChatSquare,
  VideoPause,
  Monitor,
  showTitle,
  Right,
  userId,
  Back,
  SetUp,
  route,
  user,
} = useAside();
</script>
<style lang="less" scoped>
@import "../../assets/css/commonaside.less";
</style>
