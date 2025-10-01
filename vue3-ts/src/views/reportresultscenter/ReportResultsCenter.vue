<template>
  <div class="admin-report-center-container">
    <!-- 页面标题和操作栏 -->
    <div class="header-section">
      <div class="header-main">
        <h1 class="page-title">
          <el-icon class="title-icon"><Document /></el-icon>
          举报与反馈管理中心
        </h1>
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
      <div class="header-subtitle">管理用户反馈与举报内容，维护平台秩序</div>
    </div>

    <!-- 统计概览 -->
    <el-card class="stats-card" shadow="hover">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ feedbackStats.total }}</div>
              <div class="stat-label">总反馈数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ feedbackStats.pending }}</div>
              <div class="stat-label">待处理反馈</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon processed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ feedbackStats.processed }}</div>
              <div class="stat-label">已处理反馈</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ reportStats.total }}</div>
              <div class="stat-label">总举报数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ reportStats.pending }}</div>
              <div class="stat-label">待处理举报</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <div class="stat-item">
            <div class="stat-icon processed">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ reportStats.processed }}</div>
              <div class="stat-label">已处理举报</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 标签页：切换反馈和举报 -->
    <el-card class="tabs-card" shadow="hover">
      <el-tabs
        v-model="activeTab"
        class="admin-report-tabs"
        @tab-change="handleTabChange"
      >
        <!-- 用户反馈管理 -->
        <el-tab-pane label="用户反馈管理" name="feedback">
          <div class="tab-content">
            <!-- 反馈筛选器 -->
            <div class="filter-section">
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-input
                    v-model="feedbackFilters.keyword"
                    placeholder="搜索反馈内容、姓名或邮箱"
                    clearable
                    @clear="searchFeedback"
                    @keyup.enter="searchFeedback"
                    class="filter-input"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :xs="12" :sm="6" :md="4" :lg="3">
                  <el-select
                    v-model="feedbackFilters.status"
                    placeholder="处理状态"
                    clearable
                    @change="filterFeedback"
                    class="filter-select"
                  >
                    <el-option label="全部状态" value="" />
                    <el-option label="待处理" value="pending" />
                    <el-option label="已处理" value="processed" />
                  </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="10">
                  <el-date-picker
                    v-model="feedbackFilters.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    @change="filterFeedback"
                    class="filter-date"
                  />
                </el-col>
                <el-col :xs="12" :sm="6" :md="4" :lg="3">
                  <el-button @click="resetFeedbackFilters" class="filter-reset">
                    重置筛选
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 反馈列表 -->
            <div class="table-container">
              <el-table
                :data="filteredFeedbacks"
                v-loading="isLoading"
                stripe
                style="width: 100%"
                class="data-table"
                empty-text="暂无反馈数据"
              >
                <el-table-column
                  prop="id"
                  label="ID"
                  width="80"
                  align="center"
                />
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column
                  prop="email"
                  label="邮箱"
                  min-width="180"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="feedback"
                  label="反馈内容"
                  min-width="200"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <div class="content-cell">
                      {{ previewText(row.feedback, 50) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag
                      :type="getStatusType(row.status)"
                      class="status-tag"
                    >
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="提交时间" width="160">
                  <template #default="{ row }">
                    {{ formatTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="180"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button
                        v-if="isAdmin && !row.status"
                        type="success"
                        size="small"
                        @click="openProcessDialog(row.id, 'feedback')"
                        class="action-btn process-btn"
                      >
                        处理
                      </el-button>
                      <el-button
                        v-if="!isAdmin"
                        type="primary"
                        size="small"
                        @click="viewFeedbackDetails(row)"
                        class="action-btn detail-btn"
                      >
                        详情
                      </el-button>
                      <el-button
                        v-if="!isAdmin"
                        type="danger"
                        size="small"
                        @click="deleteFeedback(row.id)"
                        class="action-btn delete-btn"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 举报管理 -->
        <el-tab-pane label="举报管理" name="reports">
          <div class="tab-content">
            <!-- 举报筛选器 -->
            <div class="filter-section">
              <el-row :gutter="16">
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-input
                    v-model="reportFilters.keyword"
                    placeholder="搜索举报内容"
                    clearable
                    @clear="searchReports"
                    @keyup.enter="searchReports"
                    class="filter-input"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-col>
                <el-col :xs="12" :sm="6" :md="4" :lg="3">
                  <el-select
                    v-model="reportFilters.status"
                    placeholder="处理状态"
                    clearable
                    @change="filterReports"
                    class="filter-select"
                  >
                    <el-option label="全部状态" value="" />
                    <el-option label="待处理" value="pending" />
                    <el-option label="已处理" value="processed" />
                  </el-select>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="10">
                  <el-date-picker
                    v-model="reportFilters.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    @change="filterReports"
                    class="filter-date"
                  />
                </el-col>
                <el-col :xs="12" :sm="6" :md="4" :lg="3">
                  <el-button @click="resetReportFilters" class="filter-reset">
                    重置筛选
                  </el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 举报列表 -->
            <div class="table-container">
              <el-table
                :data="filteredReports"
                v-loading="isLoading"
                stripe
                style="width: 100%"
                class="data-table"
                empty-text="暂无举报数据"
              >
                <el-table-column
                  prop="id"
                  label="举报ID"
                  width="80"
                  align="center"
                />
                <el-table-column
                  prop="userId"
                  label="举报人ID"
                  width="100"
                  align="center"
                />
                <el-table-column
                  prop="wallId"
                  label="被举报内容ID"
                  width="120"
                  align="center"
                />
                <el-table-column
                  prop="wall.content"
                  label="被举报内容"
                  min-width="200"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <div class="content-cell">
                      {{ previewText(row.wall?.content, 50) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag
                      :type="getStatusType(row.status)"
                      class="status-tag"
                    >
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="举报时间" width="160">
                  <template #default="{ row }">
                    {{ formatTime(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="180"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button
                        v-if="isAdmin && !row.status"
                        type="success"
                        size="small"
                        @click="openProcessDialog(row.id, 'report')"
                        class="action-btn process-btn"
                      >
                        处理
                      </el-button>
                      <el-button
                        v-if="!isAdmin"
                        type="primary"
                        size="small"
                        @click="viewReportDetails(row)"
                        class="action-btn detail-btn"
                      >
                        详情
                      </el-button>
                      <el-button
                        v-if="!isAdmin"
                        type="danger"
                        size="small"
                        @click="deleteReport(row.id)"
                        class="action-btn delete-btn"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="`处理${processType === 'feedback' ? '用户反馈' : '举报内容'}`"
      width="600px"
      class="process-dialog"
      align-center
    >
      <el-form :model="processForm" label-width="100px">
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

        <el-form-item label="处理说明">
          <el-input
            v-model="processForm.resultDetail"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitProcess"
            :loading="isProcessing"
          >
            确认处理
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="feedbackDetailVisible"
      title="反馈详情"
      width="600px"
      align-center
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{
          currentFeedback?.id
        }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{
          currentFeedback?.name
        }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{
          currentFeedback?.email
        }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{
          formatTime(currentFeedback?.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentFeedback?.status)">
            {{ getStatusText(currentFeedback?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="反馈内容">
          <div class="detail-content">
            {{ currentFeedback?.feedback }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentFeedback?.status" label="处理结果">
          <div class="process-result-detail">
            <div>
              <strong>处理类型：</strong>
              {{ formatResultType(currentFeedback?.resultType) }}
            </div>
            <div v-if="currentFeedback?.resultDetail">
              <strong>处理说明：</strong>{{ currentFeedback?.resultDetail }}
            </div>
            <div>
              <strong>处理时间：</strong>
              {{ formatTime(currentFeedback?.processTime) }}
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feedbackDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 举报详情对话框 -->
    <el-dialog
      v-model="reportDetailVisible"
      title="举报详情"
      width="700px"
      align-center
    >
      <el-tabs v-model="reportDetailTab" class="detail-tabs">
        <el-tab-pane label="举报信息" name="report">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="举报ID">{{
              currentReport?.id
            }}</el-descriptions-item>
            <el-descriptions-item label="举报时间">{{
              formatTime(currentReport?.createdAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentReport?.status)">
                {{ getStatusText(currentReport?.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="举报人信息" name="reporter">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">{{
              currentReport?.user?.id
            }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{
              currentReport?.user?.nickname
            }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{
              currentReport?.user?.email
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="被举报内容" name="reported">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="留言ID">{{
              currentReport?.wall?.id
            }}</el-descriptions-item>
            <el-descriptions-item label="内容">
              <div class="detail-content">
                {{ currentReport?.wall?.content }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">{{
              formatTime(currentReport?.wall?.createdAt)
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="发布者信息" name="publisher">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">{{
              currentReport?.wall?.User?.id
            }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{
              currentReport?.wall?.User?.nickname
            }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{
              currentReport?.wall?.User?.email
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane
          v-if="currentReport?.status"
          label="处理结果"
          name="result"
        >
          <el-descriptions :column="1" border>
            <el-descriptions-item label="处理类型">{{
              formatResultType(currentReport?.resultType)
            }}</el-descriptions-item>
            <el-descriptions-item
              label="处理说明"
              v-if="currentReport?.resultDetail"
            >
              {{ currentReport?.resultDetail }}
            </el-descriptions-item>
            <el-descriptions-item label="处理时间">{{
              formatTime(currentReport?.processTime)
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reportDetailVisible = false">关闭</el-button>
        </span>
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
const isProcessing = ref(false);

// 表单数据
const processForm = ref({
  resultType: "",
  resultDetail: "",
});

// 新增：为每个反馈卡片创建独立的展开状态
const feedbackExpandStates = ref<Record<number, boolean>>({});
const reportExpandStates = ref<Record<number, boolean>>({});

// 添加过滤器状态
const feedbackFilters = ref({
  keyword: "",
  status: "",
  dateRange: "",
});

const reportFilters = ref({
  keyword: "",
  status: "",
  dateRange: "",
});

// 添加分页状态
const feedbackPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const reportPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 添加详情对话框状态
const feedbackDetailVisible = ref(false);
const reportDetailVisible = ref(false);
const reportDetailTab = ref("report");

// 当前查看的反馈和举报详情
const currentFeedback = ref<any>(null);
const currentReport = ref<any>(null);

// 添加统计数据
const feedbackStats = computed(() => {
  const total = feedbacks.value.length;
  const processed = feedbacks.value.filter((item: any) => item.status).length;
  const pending = total - processed;
  return {
    total,
    processed,
    pending,
  };
});

const reportStats = computed(() => {
  const total = reports.value.length;
  const processed = reports.value.filter((item: any) => item.status).length;
  const pending = total - processed;
  return {
    total,
    processed,
    pending,
  };
});

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

const openProcessDialog = (
  id: string | number,
  type: "feedback" | "report"
) => {
  processType.value = type;
  currentProcessId.value = id;
  processForm.value = { resultType: "", resultDetail: "" };
  processDialogVisible.value = true;
};

const submitProcess = async () => {
  try {
    if (!processForm.value.resultType) {
      ElMessage.warning("请选择处理类型");
      return;
    }

    isProcessing.value = true;
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
    isProcessing.value = false;
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

const previewText = (text?: string, length: number = 100) => {
  if (!text) return "无内容";
  return text.length > length ? text.substring(0, length) + "..." : text;
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

// 新增方法：搜索反馈
const searchFeedback = () => {
  // 实现搜索反馈逻辑
  console.log("搜索反馈:", feedbackFilters.value.keyword);
};

// 新增方法：搜索举报
const searchReports = () => {
  // 实现搜索举报逻辑
  console.log("搜索举报:", reportFilters.value.keyword);
};

// 新增方法：重置反馈筛选器
const resetFeedbackFilters = () => {
  feedbackFilters.value = {
    keyword: "",
    status: "",
    dateRange: "",
  };
  searchFeedback();
};

// 新增方法：重置举报筛选器
const resetReportFilters = () => {
  reportFilters.value = {
    keyword: "",
    status: "",
    dateRange: "",
  };
  searchReports();
};

// 新增方法：查看反馈详情
const viewFeedbackDetails = (feedback: any) => {
  currentFeedback.value = feedback;
  feedbackDetailVisible.value = true;
};

// 新增方法：查看举报详情
const viewReportDetails = (report: any) => {
  currentReport.value = report;
  reportDetailVisible.value = true;
};

// 生命周期钩子
onMounted(() => {
  submitFeedback();
  getReportList();
});
</script>

<style scoped lang="scss">
.admin-report-center-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);

  .header-section {
    margin-bottom: 24px;

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .page-title {
        display: flex;
        align-items: center;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0;

        .title-icon {
          margin-right: 10px;
          color: #409eff;
        }
      }

      .header-actions {
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }

    .header-subtitle {
      font-size: 14px;
      color: #909399;
    }
  }

  .stats-card {
    margin-bottom: 24px;
    border-radius: 8px;
    border: none;

    .stat-item {
      display: flex;
      align-items: center;
      padding: 16px 0;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 8px;
        margin-right: 12px;
        font-size: 20px;

        &.total {
          background-color: #ecf5ff;
          color: #409eff;
        }

        &.pending {
          background-color: #fdf6ec;
          color: #e6a23c;
        }

        &.processed {
          background-color: #f0f9eb;
          color: #67c23a;
        }
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .tabs-card {
    border-radius: 8px;
    border: none;

    :deep(.el-tabs__header) {
      margin-bottom: 0;

      .el-tabs__nav-wrap {
        padding: 0 24px;

        &::after {
          height: 1px;
        }
      }

      .el-tabs__item {
        font-weight: 500;
        padding: 0 20px;
        height: 50px;
        line-height: 50px;
      }
    }

    :deep(.el-tabs__content) {
      padding: 24px;
    }

    .tab-content {
      .filter-section {
        margin-bottom: 20px;

        .filter-input,
        .filter-select,
        .filter-date,
        .filter-reset {
          width: 100%;
        }
      }

      .table-container {
        .data-table {
          border-radius: 8px;
          overflow: hidden;

          :deep(.el-table__header) {
            th {
              background-color: #f5f7fa;
              color: #606266;
              font-weight: 600;
            }
          }

          .content-cell {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .status-tag {
            border: none;
            font-weight: 500;
          }

          .action-buttons {
            display: flex;
            justify-content: center;
            gap: 8px;

            .action-btn {
              border-radius: 4px;
              font-weight: 500;

              &.process-btn {
                background-color: #67c23a;
                border-color: #67c23a;
              }

              &.detail-btn {
                background-color: #409eff;
                border-color: #409eff;
              }

              &.delete-btn {
                background-color: #f56c6c;
                border-color: #f56c6c;
              }
            }
          }
        }
      }
    }
  }

  .process-dialog,
  .el-dialog {
    border-radius: 12px;

    :deep(.el-dialog__header) {
      padding: 20px 20px 10px;
      border-bottom: 1px solid #e4e7ed;
      margin-right: 0;

      .el-dialog__title {
        font-weight: 600;
        color: #303133;
      }
    }

    :deep(.el-dialog__body) {
      padding: 20px;
    }

    :deep(.el-dialog__footer) {
      padding: 10px 20px 20px;
      border-top: 1px solid #e4e7ed;
    }
  }

  .detail-content {
    white-space: pre-wrap;
    line-height: 1.6;
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  .process-result-detail {
    div {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .detail-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }
  }
}

@media (max-width: 768px) {
  .admin-report-center-container {
    padding: 16px;

    .header-section {
      .header-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
          width: 100%;

          .refresh-btn {
            width: 100%;
          }
        }
      }
    }

    .stats-card {
      .el-row {
        .el-col {
          flex: 0 0 50%;
          max-width: 50%;
          margin-bottom: 10px;
        }
      }
    }

    .tabs-card {
      :deep(.el-tabs__content) {
        padding: 16px;
      }

      .tab-content {
        .filter-section {
          .el-row {
            .el-col {
              margin-bottom: 12px;
            }
          }
        }

        .table-container {
          overflow-x: auto;

          .data-table {
            min-width: 800px;

            .action-buttons {
              flex-direction: column;
              gap: 4px;

              .action-btn {
                width: 100%;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .admin-report-center-container {
    .stats-card {
      .el-row {
        .el-col {
          flex: 0 0 100%;
          max-width: 100%;
        }
      }
    }
  }
}
</style>
