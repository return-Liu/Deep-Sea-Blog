<template>
  <div class="dashboard-container">
    <!-- 建议与反馈列表 -->
    <section class="feedback-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="el-icon-chat-line-round"></i>
          用户反馈
        </h2>
        <div class="section-toolbar">
          <div class="time-filter">
            <el-select
              v-model="feedbackTimeRange"
              placeholder="时间范围"
              size="small"
              @change="filterFeedback"
            >
              <el-option label="最近一周" value="week"></el-option>
              <el-option label="最近一个月" value="month"></el-option>
              <el-option label="最近三个月" value="quarter"></el-option>
              <el-option label="全部" value="all"></el-option>
            </el-select>
          </div>
          <div class="section-actions">
            <el-button
              type="primary"
              size="small"
              @click="refreshData"
              class="refresh-btn"
            >
              <i class="el-icon-refresh"></i> 刷新
            </el-button>
          </div>
        </div>
      </div>

      <div class="feedback-list">
        <el-card
          v-for="(item, index) in filteredFeedbacks"
          :key="index"
          class="feedback-item"
          shadow="hover"
        >
          <div class="feedback-header">
            <div class="user-info">
              <user-avatar :email="item.email" />
              <div class="user-details">
                <h3 class="user-name">{{ item.name }}</h3>
                <p class="user-email">{{ item.email }}</p>
              </div>
            </div>
            <div class="feedback-meta">
              <el-tag
                :type="getStatusType(item.status)"
                size="small"
                effect="light"
              >
                {{ getStatusText(item.status) }}
              </el-tag>
              <span class="feedback-time">
                <i class="el-icon-time"></i>
                {{ formatTime(item.createdAt) }}
              </span>
            </div>
          </div>

          <div class="feedback-content">
            <el-collapse v-model="activeFeedback" accordion>
              <el-collapse-item :name="item.id">
                <template #title>
                  <span class="feedback-preview">{{
                    previewText(item.feedback)
                  }}</span>
                </template>
                <div class="feedback-detail">
                  <p>{{ item.feedback }}</p>

                  <!-- 处理结果展示 -->
                  <div v-if="item.status" class="process-result">
                    <el-divider></el-divider>
                    <div class="result-header">
                      <i class="el-icon-info"></i>
                      <span>Deep Sea 管理员回复</span>
                    </div>
                    <div class="result-content">
                      <p>
                        <strong>处理结果：</strong>
                        {{ formatResultType(item.resultType) }}
                      </p>
                      <p v-if="item.resultDetail">
                        <strong>处理说明：</strong>{{ item.resultDetail }}
                      </p>
                      <p class="process-time">
                        <i class="el-icon-time"></i> 处理时间：{{
                          formatTime(item.processTime)
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div class="feedback-actions">
            <el-button
              v-if="!item.status && isAdmin"
              type="success"
              size="small"
              @click="openProcessDialog(item.id, 'feedback')"
              class="action-btn"
            >
              <i class="el-icon-check"></i> 处理
            </el-button>
            <el-button
              v-if="item.userId === user?.id"
              type="danger"
              size="small"
              @click="deleteFeedback(item.id)"
              class="action-btn"
            >
              <i class="el-icon-delete"></i> 删除
            </el-button>

            <el-button
              type="primary"
              size="small"
              @click="toggleFeedbackDetail(item.id)"
              class="detail-btn"
            >
              {{ activeFeedback === item.id ? "收起详情" : "查看详情" }}
              <i
                :class="[
                  'el-icon-arrow-down',
                  { rotate: activeFeedback === item.id },
                ]"
              ></i>
            </el-button>
          </div>
        </el-card>

        <div v-if="filteredFeedbacks.length === 0" class="empty-state">
          <el-empty description="暂无用户反馈" :image-size="100"></el-empty>
        </div>

        <div class="load-more-container">
          <el-button
            v-if="currentFeedbacks.length < feedbacks.length"
            type="text"
            @click="loadMore"
            :loading="isLoading"
            class="load-more-btn"
          >
            加载更多 <i class="el-icon-arrow-down"></i>
          </el-button>
          <div v-else-if="currentFeedbacks.length > 0" class="no-more">
            <el-divider>没有更多了</el-divider>
          </div>
        </div>
      </div>
    </section>

    <!-- 举报列表 -->
    <section class="report-section">
      <div class="section-header">
        <h2 class="section-title">
          <i class="el-icon-warning-outline"></i>
          举报管理
        </h2>
        <div class="section-toolbar">
          <div class="time-filter">
            <el-select
              v-model="reportTimeRange"
              placeholder="时间范围"
              size="small"
              @change="filterReports"
            >
              <el-option label="最近一周" value="week"></el-option>
              <el-option label="最近一个月" value="month"></el-option>
              <el-option label="最近三个月" value="quarter"></el-option>
              <el-option label="全部" value="all"></el-option>
            </el-select>
          </div>
          <div class="section-actions">
            <el-button
              type="primary"
              size="small"
              @click="refreshData"
              class="refresh-btn"
            >
              <i class="el-icon-refresh"></i> 刷新
            </el-button>
          </div>
        </div>
      </div>

      <div class="report-list">
        <el-card
          v-for="(report, index) in filteredReports"
          :key="index"
          class="report-item"
          shadow="hover"
        >
          <div class="report-header">
            <div class="report-meta">
              <span class="report-id">举报ID：{{ report.id }}</span>
              <el-tag
                :type="getStatusType(report.status)"
                size="small"
                effect="light"
              >
                {{ getStatusText(report.status) }}
              </el-tag>
            </div>
            <div class="report-time">
              <i class="el-icon-time"></i>
              {{ formatTime(report.createdAt) }}
            </div>
          </div>

          <div class="report-content">
            <el-collapse v-model="activeReport" accordion>
              <el-collapse-item :name="report.id">
                <template #title>
                  <div class="report-preview">
                    <span
                      >举报内容：{{
                        previewText(report.wall?.content || "无内容")
                      }}</span
                    >
                  </div>
                </template>

                <div class="report-detail">
                  <div class="info-sections">
                    <!-- 举报人信息 -->
                    <div class="info-section">
                      <h4 class="info-title">
                        <i class="el-icon-user"></i> 举报人信息
                      </h4>
                      <div class="info-content">
                        <div class="info-row">
                          <span class="info-label">邮箱：</span>
                          <span class="info-value">{{
                            report.user?.email || "无"
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">昵称：</span>
                          <span class="info-value">{{
                            report.user?.nickname || "无"
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 被举报内容 -->
                    <div class="info-section">
                      <h4 class="info-title">
                        <i class="el-icon-document"></i> 被举报内容
                      </h4>
                      <div class="info-content">
                        <div class="info-row">
                          <span class="info-label">留言ID：</span>
                          <span class="info-value">{{
                            report.wall?.id || "无"
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">留言内容：</span>
                          <span class="info-value">{{
                            report.wall?.content || "无"
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">发布时间：</span>
                          <span class="info-value">{{
                            formatTime(report.wall?.createdAt)
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 发布者信息 -->
                    <div class="info-section">
                      <h4 class="info-title">
                        <i class="el-icon-user-solid"></i> 发布者信息
                      </h4>
                      <div class="info-content">
                        <div class="info-row">
                          <span class="info-label">邮箱：</span>
                          <span class="info-value">{{
                            report.wall?.User?.email || "无"
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">昵称：</span>
                          <span class="info-value">{{
                            report.wall?.User?.nickname || "无"
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 处理结果展示 -->
                  <div v-if="report.status" class="process-result">
                    <el-divider></el-divider>
                    <div class="result-header">
                      <i class="el-icon-info"></i>
                      <span>管理员处理结果</span>
                    </div>
                    <div class="result-content">
                      <p>
                        <strong>处理结果：</strong>
                        {{ formatResultType(report.resultType) }}
                      </p>
                      <p v-if="report.resultDetail">
                        <strong>处理说明：</strong>{{ report.resultDetail }}
                      </p>
                      <p class="process-time">
                        <i class="el-icon-time"></i> 处理时间：{{
                          formatTime(report.processTime)
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div class="report-actions">
            <el-button
              v-if="!report.status && isAdmin"
              type="success"
              size="small"
              @click="openProcessDialog(report.id, 'report')"
              class="action-btn"
            >
              <i class="el-icon-check"></i> 处理
            </el-button>
            <el-button
              v-if="report.userId === user?.id || report.user?.id === user?.id"
              type="danger"
              size="small"
              @click="deleteReport(report.id)"
              class="action-btn"
            >
              <i class="el-icon-delete"></i> 删除
            </el-button>

            <el-button
              type="primary"
              size="small"
              @click="toggleReportDetail(report.id)"
              class="detail-btn"
            >
              {{ activeReport === report.id ? "收起详情" : "查看详情" }}
              <i
                :class="[
                  'el-icon-arrow-down',
                  { rotate: activeReport === report.id },
                ]"
              ></i>
            </el-button>
          </div>
        </el-card>

        <div v-if="filteredReports.length === 0" class="empty-state">
          <el-empty description="暂无举报内容" :image-size="100"></el-empty>
        </div>

        <div class="load-more-container">
          <el-button
            v-if="currentReports.length < reports.length"
            type="text"
            @click="loadMore"
            :loading="isLoading"
            class="load-more-btn"
          >
            加载更多 <i class="el-icon-arrow-down"></i>
          </el-button>
          <div v-else-if="currentReports.length > 0" class="no-more">
            <el-divider>没有更多了</el-divider>
          </div>
        </div>
      </div>
    </section>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="`处理${processType === 'feedback' ? '用户反馈' : '举报'}`"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理类型" required>
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
        <el-form-item label="处理说明">
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
          {{ processing ? "处理中..." : "确认处理" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useGeneral } from "../../hooks/usegeneral";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";

const userStore = useUserStore();
const user = computed(() => userStore.user);
const isAdmin = computed(() => user.value?.id === 4); // 假设管理员ID为4

const feedbackTimeRange = ref("week");
const reportTimeRange = ref("week");

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

// Filtered data
const filteredFeedbacks = computed(() => currentFeedbacks.value);
const filteredReports = computed(() => currentReports.value);

// Collapse state
const activeFeedback = ref<string | number>("");
const activeReport = ref<string | number>("");

// 处理相关状态
const processDialogVisible = ref(false);
const processType = ref<"feedback" | "report">("feedback");
const currentProcessId = ref<number | string>("");
const processing = ref(false);
const processForm = ref({
  resultType: "",
  resultDetail: "",
});

const formatResultType = (type: string) => {
  const map: Record<string, string> = {
    fixed: "已修复",
    verified: "已核实",
    rejected: "已驳回",
    ignored: "已忽略",
    other: "其他处理",
  };
  return map[type] || "未知状态";
};

const resultTypeOptions = [
  { value: "fixed", label: "已修复" },
  { value: "verified", label: "已核实" },
  { value: "rejected", label: "已驳回" },
  { value: "ignored", label: "已忽略" },
  { value: "other", label: "其他处理" },
];

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

// 状态显示相关
const getStatusType = (status: boolean) => {
  return status ? "success" : "warning";
};

const getStatusText = (status: boolean) => {
  return status ? "已处理" : "待处理";
};

// 工具函数
const formatTime = (timeString?: string) => {
  if (!timeString) return "无";
  return new Date(timeString).toLocaleString();
};

const previewText = (text?: string) => {
  if (!text) return "无内容";
  return text.length > 50 ? text.substring(0, 50) + "..." : text;
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

// 数据操作
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

    const response = await axiosConfig.delete(`/admin/wall/report/${id}`);

    showSuccessMessage(response.data.message || "删除成功");
    getReportList();
  } catch (error: any) {
    if (error !== "cancel" && error !== "close") {
      showErrorMessage(error);
    }
  }
};

const deleteFeedback = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要删除此反馈吗？此操作不可撤销", "警告", {
      confirmButtonText: "确定删除",
      cancelButtonText: "取消",
      type: "error",
      distinguishCancelAndClose: true,
    });

    const response = await axiosConfig.delete(`/admin/feedback/${id}`);

    showSuccessMessage(response.data.message);
    submitFeedback();
  } catch (error: any) {
    if (error !== "cancel" && error !== "close") {
      showErrorMessage(error);
    }
  }
};

const toggleFeedbackDetail = (id: string | number) => {
  activeFeedback.value = activeFeedback.value === id ? "" : id;
};

const toggleReportDetail = (id: string | number) => {
  activeReport.value = activeReport.value === id ? "" : id;
};

const filterFeedback = () => {};

const filterReports = () => {};

onMounted(() => {
  submitFeedback();
  getReportList();
});
</script>

<style scoped lang="less">
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;

  .feedback-section,
  .report-section {
    background-color: var(--bg2);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 30px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-bg4);
    display: flex;
    align-items: center;
    margin: 0;

    i {
      margin-right: 10px;
      font-size: 20px;
    }
  }

  .section-toolbar {
    display: flex;
    align-items: center;
    gap: 15px;

    .time-filter {
      width: 130px;
    }

    .section-actions {
      .refresh-btn {
        padding: 8px 12px;
        border-radius: 4px;
        background-color: var(--bg2);
        border: 1px solid var(--border);
        color: var(--color-bg4);

        i {
          margin-right: 5px;
        }

        &:hover {
          background-color: var(--color-bg4);
          color: var(--white);
        }
      }
    }
  }
}

.feedback-list,
.report-list {
  margin-top: 20px;

  .empty-state {
    padding: 40px 0;
    text-align: center;
    background-color: var(--bg1);
    border-radius: 4px;
    margin: 20px 0;
    border: 1px solid var(--border);
  }
}

.feedback-item,
.report-item {
  margin-bottom: 20px;
  transition: all 0.3s;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--bg2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.08);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  .user-info {
    display: flex;
    align-items: center;

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gradient-bg1);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .user-details {
      margin-left: 12px;

      .user-name {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-bg4);
      }

      .user-email {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--color-bg5);
      }
    }
  }

  .feedback-meta {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-tag {
      font-weight: 500;
      padding: 0 8px;
      height: 24px;
      line-height: 24px;
    }

    .feedback-time {
      font-size: 12px;
      color: var(--color-bg5);
      display: flex;
      align-items: center;

      i {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  .report-meta {
    display: flex;
    align-items: center;
    gap: 10px;

    .report-id {
      font-weight: 500;
      color: var(--color-bg4);
      font-size: 14px;
    }

    .el-tag {
      font-weight: 500;
      padding: 0 8px;
      height: 24px;
      line-height: 24px;
    }
  }

  .report-time {
    color: var(--color-bg5);
    font-size: 12px;
    display: flex;
    align-items: center;

    i {
      margin-right: 4px;
      font-size: 14px;
    }
  }
}

.feedback-content,
.report-content {
  padding: 12px 0;
  line-height: 1.6;
  color: var(--color-bg4);

  .feedback-preview,
  .report-preview {
    display: inline-block;
    max-width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-bg4);
    font-size: 14px;
  }

  :deep(.el-collapse) {
    border: none;

    .el-collapse-item__header {
      border: none;
      padding: 0;
      height: auto;
      line-height: 1.6;
      font-size: 14px;
      color: var(--color-bg4);
      background-color: transparent;
    }

    .el-collapse-item__content {
      padding: 16px 0 0;
      color: var(--color-bg4);
      font-size: 14px;
      line-height: 1.8;
      background-color: transparent;
    }
  }

  .feedback-detail,
  .report-detail {
    p {
      margin: 0 0 10px;
      word-break: break-word;
    }
  }
}

.process-result {
  margin-top: 15px;
  padding: 12px;
  background-color: var(--bg1);
  border-radius: 4px;
  border-left: 4px solid var(--gradient-bg1);

  .result-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: var(--gradient-bg1);
    font-weight: bold;
    font-size: 14px;

    i {
      margin-right: 8px;
      font-size: 16px;
    }
  }

  .result-content {
    p {
      margin: 6px 0;
      line-height: 1.6;
      font-size: 13px;

      strong {
        color: var(--color-bg3);
      }
    }

    .process-time {
      font-size: 12px;
      color: var(--color-bg5);
      display: flex;
      align-items: center;

      i {
        margin-right: 4px;
      }
    }
  }
}

.info-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  .info-section {
    padding: 12px;
    background-color: var(--bg1);
    border-radius: 4px;
    border: 1px solid var(--border);

    .info-title {
      margin: 0 0 12px;
      font-size: 14px;
      color: var(--gradient-bg1);
      display: flex;
      align-items: center;

      i {
        margin-right: 6px;
      }
    }

    .info-content {
      .info-row {
        margin-bottom: 8px;
        font-size: 13px;
        display: flex;

        &:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: var(--color-bg5);
          min-width: 70px;
        }

        .info-value {
          color: var(--color-bg4);
          word-break: break-word;
          flex: 1;
        }
      }
    }
  }
}

.feedback-actions,
.report-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--border);

  .action-btn {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;
    border: 1px solid var(--border);

    i {
      margin-right: 5px;
    }

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }

  .detail-btn {
    padding: 8px 12px;
    color: var(--gradient-bg1);
    background-color: var(--bg1);
    border-color: var(--border);
    border-radius: 4px;
    font-size: 13px;
    transition: all 0.2s;

    i {
      margin-left: 5px;
      transition: transform 0.3s;

      &.rotate {
        transform: rotate(180deg);
      }
    }

    &:hover {
      background-color: var(--bg2);
      color: var(--gradient-bg1);
    }
  }
}

.load-more-container {
  text-align: center;
  margin: 20px 0;

  .load-more-btn {
    color: var(--gradient-bg1);
    font-size: 14px;
    display: inline-flex;
    align-items: center;

    i {
      margin-left: 4px;
    }

    &:hover {
      color: var(--gradient-bg2);
    }
  }

  .no-more {
    color: var(--color-bg5);
    font-size: 12px;

    .el-divider {
      margin: 0 0 10px;
      :deep(.el-divider__text) {
        background-color: var(--bg2);
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;

    .section-toolbar {
      width: 100%;
      justify-content: space-between;
    }
  }

  .info-sections {
    grid-template-columns: 1fr;
  }

  .feedback-header,
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .feedback-actions,
  .report-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .feedback-item,
  .report-item {
    margin-bottom: 15px;
  }
}

@media (max-width: 480px) {
  .feedback-content,
  .report-content {
    :deep(.el-collapse-item__header) {
      padding-right: 30px;
    }
  }

  .feedback-actions,
  .report-actions {
    .el-button {
      padding: 6px;
      min-width: 32px;
    }
  }
}
</style>
