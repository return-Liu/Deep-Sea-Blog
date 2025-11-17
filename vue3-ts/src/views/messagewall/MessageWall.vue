<template>
  <div class="walls-container">
    <el-alert
      title="留言墙承载了每一份真挚的情感与故事。您可以自由浏览，感受每一份共鸣。（创作者可编辑或删除自己的留言，共同维护这片温暖的空间。）"
      type="success"
      :closable="false"
      class="alert"
    ></el-alert>
    <nav class="walls-nav">
      <ul class="nav-list">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="changeTab(tab.id)"
        >
          {{ tab.title }}
          <div class="active-indicator"></div>
        </li>
      </ul>
      <p class="nav-desc">让每一段留言——都有被听见的温度</p>
    </nav>
    <section class="category-filter">
      <keep-alive>
        <div class="filter-group" v-show="activeTab === 'messages'">
          <button
            v-for="message in messageCategories"
            :key="message.id"
            class="filter-btn"
            :class="{ active: activeCategory === message.id }"
            @click="handleMessageClick(message)"
          >
            {{ message.name }}
          </button>
        </div>
      </keep-alive>
    </section>
    <section class="walls-sidebar">
      <el-input
        v-model="search"
        placeholder="倾听留言背后的声音..."
        clearable
        class="search"
        @clear="handleSearch"
      />
    </section>
    <main class="walls-main">
      <transition-group
        v-if="activeTab === 'messages'"
        name="staggered-fade"
        tag="div"
        class="message-grid"
      >
        <article
          v-for="(message, index) in filteredMessages"
          :key="index"
          class="message-card"
          :style="{ backgroundColor: message.backgroundColor }"
          @click="handleEditMessage(message)"
        >
          <header class="card-header">
            <time>{{ formatDate(message.date) }}</time>
            <span class="message-category">{{ message.category }}</span>
          </header>
          <div class="card-content" :style="{ color: textColor }">
            <blockquote>{{ message.content }}</blockquote>
          </div>
          <div class="message-icon">
            <div
              class="message-likes"
              :title="message.likesCount ? '取消喜欢' : '喜欢'"
              @click.stop="likeMessage(message.id)"
            >
              <HeartOutlined />
              <span style="margin-left: 5px" class="likes-count">{{
                message.likesCount
              }}</span>
            </div>
            <div
              class="message-chats"
              @click.stop="chatMessage(message.id)"
              title="评论"
            >
              <MessageOutlined />
              <span style="margin-left: 5px" class="chat-count">{{
                commentCounts[message.id] || 0
              }}</span>
            </div>

            <h3
              v-if="message"
              class="message-title"
              :style="{ color: message.nicknameColor || '#000' }"
            >
              {{ message.name }}
            </h3>
          </div>
        </article>
      </transition-group>
      <div
        v-if="activeTab === 'messages' && !filteredMessages.length"
        class="empty-state"
      >
        <yk-empty description="暂无留言，快来留下第一个足迹吧~" />
      </div>
    </main>
    <!-- 分页控件 -->
    <el-pagination
      v-if="activeTab === 'messages' && filteredMessages.length"
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      @current-change="changePage"
      style="margin-top: 20px; text-align: center"
    />
    <div class="floating-actions">
      <el-tooltip
        effect="dark"
        :content="activeTab === 'messages' ? '写留言' : '传照片'"
        placement="left"
      >
        <button
          class="fab-button"
          @click="
            activeTab === 'messages'
              ? showAddMessage()
              : (showPhotoDrawer = true)
          "
        >
          <el-icon :size="24">
            <component :is="activeTab === 'messages' ? Edit : Plus" />
          </el-icon>
        </button>
      </el-tooltip>
    </div>
    <el-drawer
      v-model="showMessageDrawer"
      :title="
        messageForm.id
          ? isEditable
            ? '重新点亮你的故事 · 修改内容、标签与颜色，让它更贴近你的心'
            : '倾听他人的心声 · 若发现不合适的内容，请帮助我们维护这片温暖留言墙'
          : '写下你的心里话 · 每一条留言都值得被温柔以待，请与我们一起守护这片墙'
      "
      direction="rtl"
      size="40%"
      :before-close="handleCloseDrawer"
      :close-on-click-modal="false"
    >
      <div
        class="message-report"
        v-if="userId !== messageForm.userId && messageForm.id"
      >
        <p @click.stop="reportQQ(messageForm.id)">
          要墙主撕下该留言墙
          <span @click.stop="reportMessage(messageForm.id)">举报该留言墙</span>
        </p>
      </div>
      <form class="message-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <div class="content-wrapper">
            <div
              class="message-content"
              :style="{
                backgroundColor: messageForm.backgroundColor,
              }"
            >
              <textarea
                v-model="messageForm.content"
                placeholder="想说什么呢？这里是你自由表达的空间..."
                class="editable-content"
                :disabled="!isEditable"
                ref="contentRef"
                :style="{ color: textColor }"
              ></textarea>
              <div class="message-footer">
                <div class="message-like">
                  <div class="message-likes">
                    <HeartOutlined />
                    <span style="margin-left: 5px" class="likes-count">{{
                      messageForm.likesCount
                    }}</span>
                  </div>
                </div>
                <div
                  class="signature-input"
                  :style="{ color: messageForm.nicknameColor || '#000' }"
                >
                  <input
                    type="text"
                    v-model="messageForm.name"
                    placeholder="签名"
                    :disabled="!isEditable"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" v-if="isEditable">
          <label style="color: #000">标签</label>
          <div class="tag-group">
            <span
              v-for="category in messageCategories"
              :key="category.id"
              class="tag"
              :class="{
                'tag-active': messageForm.category === category.id,
                'tag-disabled': !isEditable || category.id === '全部',
              }"
              @click="handleSelectTag(category)"
            >
              {{ category.name }}
            </span>
          </div>
        </div>

        <div class="form-group" v-if="isEditable">
          <label style="color: #000; font-style: italic"
            >挑选你最爱的颜色吧！</label
          >
          <!-- 提示信息 -->
          <p style="margin-top: 8px; font-size: 12px; color: #666">
            点击选择你喜欢的背景颜色，让留言更加个性化！
          </p>
          <div class="color-options">
            <span
              v-for="color in predefinedColors"
              :key="color.id"
              class="color-option"
              :class="{ active: messageForm.backgroundColor === color.color }"
              :style="{ backgroundColor: color.color }"
              @click="handleColorSelect(color)"
            >
              <!-- 默认颜色标识 -->
              <i v-if="color.id === 1" class="el-icon-check"></i>
            </span>
          </div>
        </div>
        <div v-if="isEditable" class="form-actions">
          <!-- 删除 -->
          <button
            style="margin-right: 10px"
            v-if="messageForm.id && userId === messageForm.userId"
            type="button"
            class="delete-btn"
            @click="deleteMessage(messageForm.id)"
          >
            <el-icon style="right: 5px; top: 2px"><DeleteOutlined /></el-icon>
            <span>删除留言</span>
          </button>
          <!-- 保存修改 -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="!messageForm.content.trim()"
          >
            <el-icon style="right: 5px; top: 2px"><SuccessFilled /></el-icon>
            <span>{{ isEdit ? "保存修改" : "保存留言" }}</span>
          </button>
        </div>
      </form>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import useMessageWall from "../../hooks/useMessageWall";
import { YkEmpty } from "@yike-design/ui";
const {
  props,
  predefinedColors,
  messageForm,
  isEdit,
  messages,
  tabs,
  route,
  router,
  activeTab,
  activeCategory,
  showMessageDrawer,
  imageUrl,
  userId,
  reportedMessages,
  user,
  contentRef,
  updateContent,
  getFilteredItems,
  filteredMessages,
  getTextColor,
  textColor,
  search,
  chatMessage,
  handleSelectTag,
  fetchWallData,
  handleMessageClick,
  changeTab,
  handleSearch,
  likeMessage,
  reportMessage,
  deleteMessage,
  showAddMessage,
  handleEditMessage,
  isEditable,
  handleCloseDrawer,
  handleSubmit,
  formatDate,
  messageCategories,
  Plus,
  Edit,
  HeartOutlined,
  DeleteOutlined,
  MessageOutlined,
  ElDrawer,
  showPhotoDrawer,
  commentCounts,
  handleColorSelect,
  reportQQ,
  pagination,
  changePage,
} = useMessageWall();
</script>
<style lang="less" scoped>
@import "../../base-ui/messagewall.less";
</style>
