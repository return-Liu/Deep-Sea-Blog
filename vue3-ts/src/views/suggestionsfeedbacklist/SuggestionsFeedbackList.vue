<template>
  <div class="dashboard-container">
    <!-- 建议与反馈列表 -->
    <section class="feedback-section">
      <h2 class="section-title">
        <i class="icon icon-feedback"></i>
        建议与反馈列表
      </h2>

      <div class="card-list" ref="contentSection">
        <div
          v-for="(item, index) in feedbacks"
          :key="index"
          class="feedback-card"
        >
          <div class="card-header">
            <user-avatar :email="item.email" />
            <div class="user-meta">
              <h3>{{ item.name }}</h3>
              <p class="email">{{ item.email }}</p>
            </div>
            <time class="timestamp">{{ item.formattedCreatedAt }}</time>
          </div>
          <div class="card-content">
            <p class="feedback-text">{{ item.feedback }}</p>
          </div>
          <!-- 删除 -->
          <div class="meta-item">
            <button @click="deleteFeedback(item.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-if="currentContent.length === 0" class="empty-state">
        <YkEmpty :description="'暂无建议与反馈'" type="secondary" />
      </div>
      <div v-if="currentContent.length < feedbacks.length" class="load-more">
        <p type="primary" @click="loadMore" :disabled="isLoading">加载更多</p>
      </div>
      <div v-else-if="currentContent.length > 0" class="load-more">
        <p>加载到底了</p>
      </div>
      <div v-else class="load-more">
        <p>没有更多内容</p>
      </div>
    </section>

    <!-- 举报列表 -->
    <!-- 举报列表 -->
    <section class="report-section">
      <h2 class="section-title">
        <i class="icon icon-report"></i>
        举报留言列表
      </h2>
      <div class="report-list" ref="contentSection">
        <div
          v-for="(report, index) in reports"
          :key="index"
          class="report-card"
        >
          <!-- 举报元信息 -->
          <div class="report-meta">
            <div class="meta-item">
              <label>举报ID：</label>
              <span>{{ report.id }}</span>
            </div>
            <div class="meta-item">
              <label>举报时间：</label>
              <time>{{ report.formattedCreatedAt }}</time>
            </div>
            <!-- 删除 -->
            <div class="meta-item">
              <button @click="deleteReport(report.id)" class="delete-button">
                删除
              </button>
            </div>
          </div>

          <!-- 信息三栏布局 -->
          <div class="info-columns">
            <!-- 举报人信息 -->
            <div class="info-card reporter-info">
              <h4 class="info-title">
                <i class="icon icon-user">
                  <el-icon><User /></el-icon>
                </i>
                举报人信息
              </h4>
              <div class="reporter-info">
                <p class="reporter-email">
                  <span>邮箱：</span>
                  <span>{{ report.user?.email }}</span>
                </p>
                <p class="reporter-nickname">
                  <span>昵称：</span>
                  <span>{{ report.user?.nickname }}</span>
                </p>
                <p class="reporter-time">
                  <span>举报时间：</span>
                  <time>{{ report.formattedCreatedAt }}</time>
                </p>
              </div>
            </div>
            <div class="info-card wall-info">
              <h4 class="info-title">
                <i class="icon icon-wall"></i>
                被举报内容
              </h4>
              <div class="wall-content">
                <p class="wall-id">
                  <span>留言墙ID：</span>
                  <span>{{ report.wall?.id }}</span>
                </p>
                <p class="wall-title">
                  <span>留言墙标题：</span>
                  <span>{{ report.wall?.name }}</span>
                </p>
                <p class="wall-content">
                  <span>留言内容：</span>
                  <span>{{ report.wall?.content }}</span>
                </p>
                <p class="wall-like">
                  <span>留言点赞</span>
                  <span>{{ report.wall?.likesCount }}</span>
                </p>
                <p class="wall-category">
                  <span>留言分类：</span>
                  <span>{{ report.wall?.category }}</span>
                </p>
                <p class="wall-time">
                  <span>留言时间：</span>
                  <time>{{ report.formattedWallCreatedAt }}</time>
                </p>
              </div>
            </div>
            <!-- 发布者信息 -->
            <div class="info-card publisher-info">
              <h4 class="info-title">
                <i class="icon icon-publisher">
                  <el-icon><User /></el-icon>
                </i>
                发布者信息
              </h4>
              <div class="publisher-info">
                <p class="publisher-email">
                  <span>邮箱：</span>
                  <span>{{ report.wall.User?.email }}</span>
                </p>
                <p class="publisher-nickname">
                  <span>昵称：</span>
                  <span>{{ report.wall.User?.nickname }}</span>
                </p>
                <p class="publisher-time">
                  <span>发布时间：</span>
                  <time>{{ report.formattedWallCreatedAt }}</time>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentContent.length === 0" class="empty-state">
        <YkEmpty :description="'暂无举报留言'" type="secondary" />
      </div>
      <div v-if="currentContent.length < reports.length" class="load-more">
        <p type="primary" @click="loadMore" :disabled="isLoading">加载更多</p>
      </div>
      <div v-else-if="currentContent.length > 0" class="load-more">
        <p>加载到底了</p>
      </div>
      <div v-else class="load-more">
        <p>没有更多内容</p>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts" name="SuggestionsFeedbackList">
import { ref, onMounted } from "vue";
import { YkEmpty } from "@yike-design/ui";
import axiosConfig from "../../utils/request";
import { ElMessage } from "element-plus";
import { useGeneral } from "../../hooks/usegeneral";
import { ElTable, ElTableColumn } from "element-plus";
const {
  reports,
  currentContent,
  getReportList,
  isLoading,
  contentSection,
  loadMore,
  feedbacks,
  submitFeedback,
} = useGeneral();

const deleteReport = async (id: number) => {
  try {
    await axiosConfig.delete(`/admin/wall/report/${id}`);
    localStorage.removeItem("reportedMessages");
    ElMessage.success("删除举报留言成功");
  } catch (error) {
    console.error("删除举报留言失败", error);
  }
  // 刷新列表
  getReportList();
};
const deleteFeedback = async (id: number) => {
  try {
    await axiosConfig.delete(`/admin/feedback/${id}`);
    localStorage.removeItem("reportedMessages");
    ElMessage.success("删除建议与反馈成功");
  } catch (error) {
    console.error("删除建议与反馈失败", error);
  }
  // 刷新列表
  submitFeedback();
};

onMounted(() => {
  submitFeedback();
  getReportList();
});
</script>

<style scoped lang="less">
@import "../../base-ui/suggestionsfeedbacklist.less";
.dashboard-container {
  padding: 2rem;
  min-height: 100vh;
  // background: var(--bg1);
  color: var(--color-bg4);
}

.section-title {
  font-size: 1.25rem;
  color: var(--color-bg4);
  margin: 0 0 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(7, 241, 241, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
