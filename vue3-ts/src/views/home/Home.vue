<template>
  <div class="home">
    <div class="main-container">
      <el-carousel
        class="custom-carousel"
        :interval="5000"
        indicator-position="outside"
        width="100%"
        height="400px"
      >
        <el-carousel-item>
          <div class="chat-room-card gradient-background">
            <el-card
              shadow="always"
              class="full-width-card chat-room-card-content"
            >
              <div class="title">
                <h1>Vue+Node.js</h1>
                <h1 style="width: 350px">0到1实现即时通讯聊天室</h1>
                <p style="margin-top: 20px">单聊 群聊</p>
                <p>可发送文字 表情 图片 语音 位置....</p>
                <div class="text-box">
                  <p>
                    如您对这个应用感兴趣,欢迎下载使用,当然对于需要查看设计稿和下载切图的同学,点击下方对应路口查阅。
                  </p>
                </div>
                <!-- 下载 -->
                <div class="download">
                  <span class="down-load" @click="download">下载应用</span>
                  <button @click="designdoc" class="design-doc">
                    访问设计稿原型
                    <el-icon :size="10" :color="'#fff'">
                      <ArrowRight />
                    </el-icon>
                  </button>
                </div>
              </div>
            </el-card>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="message-wall-card gradient-background">
            <el-card
              shadow="always"
              class="full-width-card message-wall-content"
            >
              <div class="title">
                <h1>一刻时光留言墙,留下你的足迹</h1>
                <p style="margin-top: 20px">当下的心情,就让他留在当下吧</p>
                <div class="text-box">
                  <p>
                    如您对留言墙感兴趣，欢迎来留言。需要查看设计稿和下载切图的同学，点击下方设计稿入口查阅
                  </p>
                </div>
                <!-- 留言-->
                <div class="Wall-doc">
                  <el-button class="wall" @click="wall">去留言</el-button>
                  <el-button class="design-doc" @click="designdoc"
                    >访问设计稿原型
                    <el-icon :size="10" :color="'#000'">
                      <ArrowRight />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-carousel-item>
        <el-carousel-item>
          <div class="yike-ui-card gradient-background">
            <el-card
              shadow="always"
              class="full-width-card yike-ui-card-content"
            >
              <div class="title">
                <h1>Yike Design</h1>
                <p>Vue3+Ts+Less 开发的前端UI框架</p>
                <div class="text-box">
                  <p style="margin-top: 50px">
                    一套简洁干净的前端UI框架。从源码出发，提供便捷的源码配置，单个组件自由组合成专属UI库，为服务于交互与展示。
                  </p>
                </div>
                <div class="action-buttons">
                  <el-button class="official-address" @click="official"
                    >官方地址</el-button
                  >
                  <el-button @click="github" class="design-doc">
                    github仓库
                    <el-icon :size="10" :color="'#000'">
                      <ArrowRight />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!--实时聊天应用 -->
      <div
        class="ai-search mini-entrance tw-cursor-pointer"
        @click="handleAiSearchClick"
      >
        <img :src="botAvatar" class="icon" />
        <div class="tooltip">
          智能体深度推理模型X1已上线，当前接入<strong>科大讯飞星火深度推理模型X1大模型</strong>。
          <br />
          如使用中遇到问题，请前往「建议与反馈」模块提交反馈。
          <br />
          <em
            >注意：此版本为测试版，禁止用于商业用途。如有任何关于模型的使用问题，请前往「建议与反馈」模块提交反馈。</em
          >
        </div>
      </div>
      <el-dialog
        v-model="aiDialogVisible"
        width="600px"
        :fullscreen="isFullscreen"
        :height="'630px'"
      >
        <div class="dialog-content">
          <div class="header">
            <h3 style="margin-top: -15px">
              智能体深度推理模型X1 内测版
              <span style="font-size: 14px; color: #e67e22; margin-left: 10px">
                基于大语言模型的智能助手，欢迎体验！
              </span>
            </h3>
            <!-- 全屏 -->
            <el-tooltip
              :content="isFullscreen ? '退出全屏聊天' : '进入全屏聊天'"
              placement="top"
            >
              <div
                class="shrink"
                @click="handleScreen"
                style="margin-right: 40px"
              >
                <el-icon style="position: absolute; top: -16px">
                  <Right v-if="!isFullscreen" />
                  <Back v-else />
                </el-icon>
              </div>
            </el-tooltip>
          </div>
          <div class="chat-container">
            <component :is="ChatWindow" ref="chatRef"></component>
          </div>
        </div>
      </el-dialog>
      <div class="statistics-container">
        <h2 class="section-title">数据模块</h2>
        <div class="stats-cards">
          <el-card class="stat-card total-visits">
            <template #header>
              <div class="card-header">
                <el-icon><View /></el-icon>
                <span>总访问量</span>
              </div>
            </template>
            <div class="stat-value">{{ totalVisits }}</div>
          </el-card>

          <el-card class="stat-card today-visits">
            <template #header>
              <div class="card-header">
                <el-icon><Timer /></el-icon>
                <span>今日访问量</span>
              </div>
            </template>
            <div class="stat-value">{{ todayVisits }}</div>
          </el-card>
        </div>
        <div class="content-cards">
          <el-card
            v-for="item in contentTypes"
            :key="item.type"
            class="content-card"
            :class="item.type"
            @click="handleAdd(item.type)"
          >
            <div class="content-header">
              <div class="content-info">
                <el-icon :size="24" :class="item.iconColor">
                  <component :is="item.icon" />
                </el-icon>
                <div class="content-text">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
              <el-button :type="item.buttonType" circle class="add-button">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
            <div class="content-count">
              <span class="count-number">{{ getTotalCount(item.type) }}</span>
              <span class="count-label">{{ item.countLabel }}</span>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="add-form"
      >
        <el-form-item
          v-if="currentType !== 'photography'"
          label="标题"
          prop="title"
        >
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="上传图库" prop="image">
          <el-upload
            class="article-uploader"
            :action="`${apiUrl}/admin/upload`"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleSuccess"
            method="post"
            :data="{ userId: userId }"
            name="image"
            :auto-upload="false"
            ref="uploadRef"
            @change="handleChange"
          >
            <div class="upload-container">
              <img v-if="imageUrl" v-lazy="imageUrl" class="uploaded-image" />
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span class="upload-text"
                  >支持图片 (JPG/PNG/GIF/WEBP/BMP) 格式，大小不超过 5MB</span
                >
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="currentType === 'essay'" label="标签" prop="label">
          <el-input v-model="formData.label" placeholder="请输入标签" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <div
            v-if="showUploadButton"
            class="avatar-upload"
            @click="submitUpload"
          >
            <el-icon><Upload /></el-icon>
            <span>上传</span>
          </div>
          <div class="avatar-upload" type="primary" @click="handleSubmit">
            <el-icon><SuccessFilled /></el-icon>
            <span>保存</span>
          </div>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts" name="home">
import { ref } from "vue";
import useHome from "../../hooks/useHome";
import { apiUrl } from "../../config";
import { Right, Back } from "@element-plus/icons-vue";
import ChatWindow from "../chatwindow/ChatWindow.vue";
const aiDialogVisible = ref(false);
const isFullscreen = ref(false);
const botAvatar =
  "https://tse2-mm.cn.bing.net/th/id/OIP-C.c6XX36qUmH-ucd5vMsLqjQHaHa?w=143&h=180&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3";
const dialogWidth = ref("400px"); // 默认宽度
const handleAiSearchClick = () => {
  aiDialogVisible.value = true;
};
const handleScreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    dialogWidth.value = "100%"; // 全屏时宽度为100%
  } else {
    dialogWidth.value = "400px"; // 非全屏时恢复默认宽度
  }
};
const uploadRef = ref<any>(null);
const {
  wall,
  designdoc,
  official,
  github,
  download,
  ArrowRight,
  todayVisits,
  totalVisits,
  contentTypes,
  currentType,
  imageUrl,
  showUploadButton,
  dialogVisible,
  formData,
  userId,
  submitUpload,
  handleSuccess,
  handleSubmit,
  handleClose,
  getTotalCount,
  handleAdd,
  beforeUpload,
  handleChange,
  dialogTitle,
  rules,
} = useHome(uploadRef);
</script>
<style lang="less" scoped>
@import "../../base-ui/home.less";
:deep(.el-dialog__title) {
  color: var(--color-bg8);
}
:deep(.el-dialog) {
  background: var(--bg3);
}
.dialog-content {
  display: flex;
  flex-direction: column;
  height: 630px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.fullscreen-btn {
  cursor: pointer;
  margin-left: 10px;
  .el-icon {
    font-size: 18px;
  }
  &:hover {
    color: #409eff;
  }
}

// 全屏时的样式
:global(.el-dialog__wrapper.is-fullscreen .el-dialog) {
  width: 100% !important;
  margin: 0 !important;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border-radius: 0;
}

.ai-search {
  position: relative;
  border-radius: 50%;
  height: 50px;
  position: fixed;
  right: 20px;
  top: 400px;
  width: 50px;
  z-index: 100;
  cursor: pointer;
  transition: all 0.3s ease;
  // 添加阴影和hover效果
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  .tooltip {
    position: absolute;
    right: 60px; // 调整文字显示位置
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    // 添加小三角
    &:after {
      content: "";
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-left: 6px solid rgba(0, 0, 0, 0.75);
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
    }
  }
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    .tooltip {
      opacity: 1;
      visibility: visible;
      right: 70px; // 悬停时文字位置细微调整，产生滑动效果
    }
    // 添加呼吸灯效果
    animation: pulse 1.5s infinite;
  }

  img {
    height: 50px;
    width: 50px;
    border-radius: 23px;
    transition: all 0.3s ease;

    &:hover {
      transform: rotate(360deg);
    }
  }
}
// 添加呼吸灯动画
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}
</style>
