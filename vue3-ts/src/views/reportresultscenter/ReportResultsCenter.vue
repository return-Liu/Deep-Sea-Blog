<template>
  <div class="report-center-container">
    <div class="header-section">
      <h1 class="page-title">举报与反馈中心 - 您的处理进度</h1>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="refreshData"
          :loading="isLoading"
          class="refresh-btn"
        >
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
      </div>
    </div>

    <el-tabs
      v-model="activeTab"
      class="report-tabs"
      @tab-change="handleTabChange"
    >
      <!-- 用户反馈标签页 -->
      <el-tab-pane label="用户反馈" name="feedback">
        <div class="tab-content">
          <div class="filters-section">
            <div class="filter-group">
              <span class="filter-label">时间范围:</span>
              <el-select
                v-model="feedbackTimeRange"
                placeholder="选择时间范围"
                @change="filterFeedback"
                class="filter-select"
              >
                <el-option label="最近一周" value="week"></el-option>
                <el-option label="最近一个月" value="month"></el-option>
                <el-option label="最近三个月" value="quarter"></el-option>
                <el-option label="全部" value="all"></el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <span class="filter-label">状态:</span>
              <el-select
                v-model="feedbackStatusFilter"
                placeholder="选择状态"
                class="filter-select"
              >
                <el-option label="全部" value=""></el-option>
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="已处理" value="processed"></el-option>
              </el-select>
            </div>
          </div>

          <div class="content-grid" v-if="filteredFeedbacks.length > 0">
            <el-card
              v-for="item in filteredFeedbacks"
              :key="item.id"
              class="content-card feedback-card"
              shadow="hover"
            >
              <div class="card-header">
                <div class="user-info">
                  <div class="avatar-placeholder">
                    <el-icon><User /></el-icon>
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ item.name }}</div>
                    <div class="user-email">{{ item.email }}</div>
                  </div>
                </div>
                <div class="status-info">
                  <el-tag :type="getStatusType(item.status)">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                  <div class="time-info">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatTime(item.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <div class="feedback-preview">
                  {{ previewText(item.feedback) }}
                </div>

                <el-collapse
                  v-model="feedbackExpandStates[item.id]"
                  v-if="item.status"
                >
                  <el-collapse-item :name="item.id">
                    <template #title>
                      <div class="collapse-title">
                        <el-icon><InfoFilled /></el-icon>
                        <span>查看处理结果</span>
                      </div>
                    </template>
                    <div class="process-result">
                      <div class="result-item">
                        <span class="result-label">处理类型:</span>
                        <span class="result-value">{{
                          formatResultType(item.resultType)
                        }}</span>
                      </div>
                      <div class="result-item" v-if="item.resultDetail">
                        <span class="result-label">处理说明:</span>
                        <span class="result-value">{{
                          item.resultDetail
                        }}</span>
                      </div>
                      <div class="result-item">
                        <span class="result-label">处理时间:</span>
                        <span class="result-value">{{
                          formatTime(item.processTime)
                        }}</span>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>

              <div class="card-footer">
                <div class="action-buttons">
                  <el-button
                    v-if="!item.status && isAdmin"
                    type="success"
                    size="small"
                    @click="openProcessDialog(item.id, 'feedback')"
                  >
                    <el-icon><Check /></el-icon>
                    <span>处理</span>
                  </el-button>
                  <el-button
                    v-if="item.userId === user?.id"
                    type="danger"
                    size="small"
                    @click="deleteFeedback(item.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <div v-else class="empty-state">
            <yk-empty description="暂无用户反馈" type="secondary" />
          </div>

          <div class="load-more-section" v-if="filteredFeedbacks.length > 0">
            <el-button
              v-if="currentFeedbacks.length < feedbacks.length"
              @click="loadMoreFeedback"
              :loading="isLoading"
              type="primary"
              link
            >
              加载更多
            </el-button>
            <div v-else class="no-more">没有更多数据了</div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 举报管理标签页 -->
      <el-tab-pane label="举报管理" name="reports">
        <div class="tab-content">
          <div class="filters-section">
            <div class="filter-group">
              <span class="filter-label">时间范围:</span>
              <el-select
                v-model="reportTimeRange"
                placeholder="选择时间范围"
                @change="filterReports"
                class="filter-select"
              >
                <el-option label="最近一周" value="week"></el-option>
                <el-option label="最近一个月" value="month"></el-option>
                <el-option label="最近三个月" value="quarter"></el-option>
                <el-option label="全部" value="all"></el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <span class="filter-label">状态:</span>
              <el-select
                v-model="reportStatusFilter"
                placeholder="选择状态"
                class="filter-select"
              >
                <el-option label="全部" value=""></el-option>
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="已处理" value="processed"></el-option>
              </el-select>
            </div>
          </div>

          <div class="content-grid" v-if="filteredReports.length > 0">
            <el-card
              v-for="report in filteredReports"
              :key="report.id"
              class="content-card report-card"
              shadow="hover"
            >
              <div class="card-header">
                <div class="report-id">举报 ID: {{ report.id }}</div>
                <div class="status-info">
                  <el-tag :type="getStatusType(report.status)">
                    {{ getStatusText(report.status) }}
                  </el-tag>
                  <div class="time-info">
                    <el-icon><Clock /></el-icon>
                    <span>{{ formatTime(report.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <div class="report-preview">
                  举报内容: {{ previewText(report.wall?.content || "无内容") }}
                </div>

                <el-collapse v-model="reportExpandStates[report.id]">
                  <el-collapse-item :name="report.id">
                    <template #title>
                      <div class="collapse-title">
                        <el-icon><Document /></el-icon>
                        <span>查看详情</span>
                      </div>
                    </template>
                    <div class="report-details">
                      <div class="detail-section">
                        <h4 class="section-title">
                          <el-icon><User /></el-icon>
                          <span>举报人信息</span>
                        </h4>
                        <div class="detail-content">
                          <div class="detail-row">
                            <span class="detail-label">邮箱:</span>
                            <span class="detail-value">{{
                              report.user?.email || "无"
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">昵称:</span>
                            <span class="detail-value">{{
                              report.user?.nickname || "无"
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="detail-section">
                        <h4 class="section-title">
                          <el-icon><ChatLineRound /></el-icon>
                          <span>被举报内容</span>
                        </h4>
                        <div class="detail-content">
                          <div class="detail-row">
                            <span class="detail-label">留言ID:</span>
                            <span class="detail-value">{{
                              report.wall?.id || "无"
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">留言内容:</span>
                            <span class="detail-value">{{
                              report.wall?.content || "无"
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">发布时间:</span>
                            <span class="detail-value">{{
                              formatTime(report.wall?.createdAt)
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="detail-section">
                        <h4 class="section-title">
                          <el-icon><UserFilled /></el-icon>
                          <span>发布者信息</span>
                        </h4>
                        <div class="detail-content">
                          <div class="detail-row">
                            <span class="detail-label">邮箱:</span>
                            <span class="detail-value">{{
                              report.wall?.User?.email || "无"
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">昵称:</span>
                            <span class="detail-value">{{
                              report.wall?.User?.nickname || "无"
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="detail-section" v-if="report.status">
                        <h4 class="section-title">
                          <el-icon><InfoFilled /></el-icon>
                          <span>处理结果</span>
                        </h4>
                        <div class="detail-content process-result">
                          <div class="detail-row">
                            <span class="detail-label">处理类型:</span>
                            <span class="detail-value">{{
                              formatResultType(report.resultType)
                            }}</span>
                          </div>
                          <div class="detail-row" v-if="report.resultDetail">
                            <span class="detail-label">处理说明:</span>
                            <span class="detail-value">{{
                              report.resultDetail
                            }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">处理时间:</span>
                            <span class="detail-value">{{
                              formatTime(report.processTime)
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>

              <div class="card-footer">
                <div class="action-buttons">
                  <el-button
                    v-if="!report.status && isAdmin"
                    type="success"
                    size="small"
                    @click="openProcessDialog(report.id, 'report')"
                  >
                    <el-icon><Check /></el-icon>
                    <span>处理</span>
                  </el-button>
                  <el-button
                    v-if="
                      report.userId === user?.id || report.user?.id === user?.id
                    "
                    type="danger"
                    size="small"
                    @click="deleteReport(report.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    <span>删除</span>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <div v-else class="empty-state">
            <yk-empty description="暂无举报内容" type="secondary" />
          </div>

          <div class="load-more-section" v-if="filteredReports.length > 0">
            <el-button
              v-if="currentReports.length < reports.length"
              @click="loadMoreReports"
              :loading="isLoading"
              type="primary"
              link
            >
              加载更多
            </el-button>
            <div v-else class="no-more">没有更多数据了</div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="`处理${processType === 'feedback' ? '用户反馈' : '举报内容'}`"
      width="500px"
      class="process-dialog"
    >
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="处理结果" required>
          <el-select
            v-model="processForm.resultType"
            placeholder="请选择处理结果"
            style="width: 100%"
          >
            <el-option
              v-for="option in resultTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="processForm.resultDetail"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明（用户可见）"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmProcess" :loading="processing">
          确认处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { YkEmpty } from "@yike-design/ui";
import {
  Refresh,
  User,
  Clock,
  InfoFilled,
  Check,
  Delete,
  Document,
  ChatLineRound,
  UserFilled,
} from "@element-plus/icons-vue";
import { useGeneral } from "../../hooks/usegeneral";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";
import {
  resultTypeOptions,
  formatResultType,
} from "../../utils/reportresultscenter";

// 组合式 API
const userStore = useUserStore();
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.id === 4);

const {
  reports,
  currentFeedbacks,
  currentReports,
  getReportList,
  isLoading,
  loadMore,
  feedbacks,
  submitFeedback,
} = useGeneral();

// 状态管理
const activeTab = ref("feedback");
const feedbackTimeRange = ref("week");
const reportTimeRange = ref("week");
const feedbackStatusFilter = ref("");
const reportStatusFilter = ref("");
const processDialogVisible = ref(false);
const processType = ref<"feedback" | "report">("feedback");
const currentProcessId = ref<number | string>("");
const processing = ref(false);

// 表单数据
const processForm = ref({
  resultType: "",
  resultDetail: "",
});

// 新增：为每个反馈卡片创建独立的展开状态
const feedbackExpandStates = ref<Record<number, boolean>>({});
const reportExpandStates = ref<Record<number, boolean>>({});

// 计算属性
const filteredFeedbacks = computed(() => {
  let result = [...currentFeedbacks.value];

  // 根据状态过滤
  if (feedbackStatusFilter.value) {
    const isProcessed = feedbackStatusFilter.value === "processed";
    result = result.filter((item) => item.status === isProcessed);
  }

  return result;
});

const filteredReports = computed(() => {
  let result = [...currentReports.value];

  // 根据状态过滤
  if (reportStatusFilter.value) {
    const isProcessed = reportStatusFilter.value === "processed";
    result = result.filter((item) => item.status === isProcessed);
  }

  return result;
});
const handleTabChange = () => {
  // 只在切换到新标签页时清空，避免影响已展开的卡片
  if (activeTab.value === "feedback") {
    // 不要清空 feedbackExpandStates，除非必要
    // 保留已有展开状态
    submitFeedback();
  } else if (activeTab.value === "reports") {
    getReportList();
  }
};

const loadMoreFeedback = () => {
  loadMore();
};

const loadMoreReports = () => {
  loadMore();
};

const openProcessDialog = (
  id: string | number,
  type: "feedback" | "report"
) => {
  processType.value = type;
  currentProcessId.value = id;
  processForm.value = { resultType: "", resultDetail: "" };
  processDialogVisible.value = true;
};

const confirmProcess = async () => {
  try {
    if (!processForm.value.resultType) {
      ElMessage.warning("请选择处理类型");
      return;
    }

    processing.value = true;
    const endpoint =
      processType.value === "feedback"
        ? `/admin/feedback/${currentProcessId.value}/process`
        : `/admin/wall/report/${currentProcessId.value}/process`;

    const response = await axiosConfig.put(endpoint, {
      resultType: processForm.value.resultType,
      resultDetail: processForm.value.resultDetail,
      processTime: new Date().toISOString(),
    });

    showSuccessMessage(response.data.message || "处理成功");
    processDialogVisible.value = false;
    refreshData();
  } catch (error: any) {
    showErrorMessage(error);
  } finally {
    processing.value = false;
  }
};

const getStatusType = (status: boolean) => {
  return status ? "success" : "warning";
};

const getStatusText = (status: boolean) => {
  return status ? "已处理" : "待处理";
};

const formatTime = (timeString?: string) => {
  if (!timeString) return "无";
  return new Date(timeString).toLocaleString();
};

const previewText = (text?: string) => {
  if (!text) return "无内容";
  return text.length > 100 ? text.substring(0, 100) + "..." : text;
};

const showSuccessMessage = (message: string) => {
  ElMessage({
    message,
    type: "success",
    duration: 2000,
    showClose: true,
    grouping: true,
  });
};

const showErrorMessage = (error: any) => {
  const message =
    error?.response?.data?.message || error?.message || "操作失败，请稍后重试";
  ElMessage({
    message,
    type: "error",
    duration: 3000,
    showClose: true,
    grouping: true,
  });
};

const refreshData = () => {
  submitFeedback();
  getReportList();

  if (
    currentFeedbacks.value.length === 0 &&
    currentReports.value.length === 0
  ) {
    ElMessage.info({
      message: "暂无新数据",
      duration: 1500,
    });
    return;
  }

  showSuccessMessage("数据已刷新");
};

const deleteReport = async (id: number) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      "确定要删除此举报记录吗？此操作不可撤销",
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "error",
        distinguishCancelAndClose: true,
      }
    );

    // 发送删除请求
    const deleteResponse = await axiosConfig.delete(`/admin/wall/report/${id}`);

    showSuccessMessage(deleteResponse.data.message || "删除成功");
    getReportList();
  } catch (error: any) {
    if (error !== "cancel" && error !== "close") {
      showErrorMessage(error);
    }
  }
};

const deleteFeedback = async (id: number) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm("确定要删除此反馈吗？此操作不可撤销", "警告", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "error",
      distinguishCancelAndClose: true,
    });

    // 发送删除请求
    const deleteResponse = await axiosConfig.delete(`/admin/feedback/${id}`);

    showSuccessMessage(deleteResponse.data.message || "删除成功");
    submitFeedback();
  } catch (error: any) {
    if (error !== "cancel" && error !== "close") {
      showErrorMessage(error);
    }
  }
};

const filterFeedback = () => {
  let result = [...feedbacks.value];

  // 根据时间范围过滤
  if (feedbackTimeRange.value !== "all") {
    const now = new Date();
    let startDate = new Date();

    switch (feedbackTimeRange.value) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    result = result.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate;
    });
  }

  // 根据状态过滤
  if (feedbackStatusFilter.value) {
    const isProcessed = feedbackStatusFilter.value === "processed";
    result = result.filter((item) => item.status === isProcessed);
  }

  // 更新当前显示的数据
  feedbacks.value = result;
};

const filterReports = () => {
  // 过滤举报的逻辑可以在这里实现
  let result = [...reports.value];

  // 根据时间范围过滤
  if (reportTimeRange.value !== "all") {
    const now = new Date();
    let startDate = new Date();

    switch (reportTimeRange.value) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    result = result.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate;
    });
  }

  // 根据状态过滤
  if (reportStatusFilter.value) {
    const isProcessed = reportStatusFilter.value === "processed";
    result = result.filter((item) => item.status === isProcessed);
  }

  // 更新当前显示的数据
  reports.value = result;
};

// 生命周期钩子
onMounted(() => {
  submitFeedback();
  getReportList();
});
</script>

<style scoped lang="scss">
.report-center-container {
  margin: 0 auto;
  padding: 20px;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .header-actions {
      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .report-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px;

      .el-tabs__nav-wrap::after {
        height: 1px;
      }

      .el-tabs__item {
        font-size: 16px;
        font-weight: 500;
        color: #606266;

        &.is-active {
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }

  .tab-content {
    .filters-section {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 8px;

      .filter-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .filter-label {
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
        }

        .filter-select {
          width: 150px;
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      .content-card {
        border-radius: 8px;
        border: 1px solid #ebeef5;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #ebeef5;

          .user-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .avatar-placeholder {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #ecf5ff;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #409eff;

              .el-icon {
                font-size: 20px;
              }
            }

            .user-details {
              .user-name {
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                margin-bottom: 4px;
              }

              .user-email {
                font-size: 12px;
                color: #909399;
              }
            }
          }

          .report-id {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
          }

          .status-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;

            .time-info {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #909399;

              .el-icon {
                font-size: 14px;
              }
            }
          }
        }

        .card-body {
          padding: 16px;

          .feedback-preview,
          .report-preview {
            font-size: 14px;
            color: #606266;
            line-height: 1.5;
            margin-bottom: 16px;
            white-space: pre-wrap;
            word-break: break-word;
          }

          :deep(.el-collapse) {
            border-top: 1px solid #ebeef5;
            border-bottom: 1px solid #ebeef5;
            margin-top: 16px;

            .el-collapse-item__header {
              padding-left: 0;
              padding-right: 0;
              border-bottom: none;

              .collapse-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: #409eff;
              }
            }

            .el-collapse-item__content {
              padding: 16px 0;
            }
          }

          .process-result,
          .report-details {
            .result-item,
            .detail-row {
              display: flex;
              margin-bottom: 12px;

              &:last-child {
                margin-bottom: 0;
              }

              .result-label,
              .detail-label {
                width: 80px;
                font-size: 14px;
                color: #909399;
                flex-shrink: 0;
              }

              .result-value,
              .detail-value {
                font-size: 14px;
                color: #606266;
                flex: 1;
                word-break: break-word;
              }
            }

            .detail-section {
              margin-bottom: 20px;

              &:last-child {
                margin-bottom: 0;
              }

              .section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                color: #303133;
                margin-bottom: 12px;

                .el-icon {
                  color: #409eff;
                }
              }

              .detail-content {
                padding-left: 24px;
              }

              .process-result {
                .detail-content {
                  padding-left: 0;
                }
              }
            }
          }
        }

        .card-footer {
          padding: 16px;
          border-top: 1px solid #ebeef5;

          .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: 40px 0;
    }

    .load-more-section {
      display: flex;
      justify-content: center;
      padding: 20px 0;

      .no-more {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .process-dialog {
    :deep(.el-dialog__body) {
      padding: 20px;
    }
  }
}

@media (max-width: 768px) {
  .report-center-container {
    padding: 15px;

    .header-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .page-title {
        font-size: 20px;
      }
    }

    .tab-content {
      .filters-section {
        flex-direction: column;
        gap: 12px;
      }

      .content-grid {
        grid-template-columns: 1fr;

        .content-card {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .status-info {
              align-items: flex-start;
            }
          }
        }
      }
    }
  }
}
</style>
