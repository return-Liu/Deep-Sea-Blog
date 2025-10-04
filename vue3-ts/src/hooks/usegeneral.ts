import { ref, computed, onMounted } from "vue";
import axiosConfig from "../utils/request";

export function useGeneral() {
  const currentPage = ref(1);
  const isLoading = ref(false);
  const contentSection = ref<HTMLElement | null>(null);
  const reports = ref<any[]>([]);
  const feedbacks = ref<any[]>([]);
  const feedbackPagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 6,
  });
  const reportPagination = ref({
    total: 0,
    currentPage: 1,
    pageSize: 6,
  });

  const handleScroll = () => {
    if (!contentSection.value) return;
    const scrollTop = contentSection.value.scrollTop;
    const clientHeight = contentSection.value.clientHeight;
    const scrollHeight = contentSection.value.scrollHeight;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value) {
      loadMore();
    }
  };

  const getReportList = async (page: number = 1) => {
    try {
      const response = await axiosConfig.get("/admin/wall/report", {
        params: {
          currentPage: page,
          pageSize: reportPagination.value.pageSize,
        },
      });
      console.log(response);

      const reportList = response.data.data.reports;
      const pagination = response.data.data.pagination;

      // 更新分页信息
      reportPagination.value.total = pagination.total;
      reportPagination.value.currentPage = page;

      const formattedReports = reportList.map((report: any) => ({
        ...report,
        formattedCreatedAt: new Date(report.createdAt).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        formattedWallCreatedAt: report.wall
          ? new Date(report.wall.createdAt).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
          : "",
      }));

      // 如果是第一页，替换数据；否则追加数据
      if (page === 1) {
        reports.value = formattedReports;
      } else {
        reports.value = [...reports.value, ...formattedReports];
      }
    } catch (error) {
      console.error("获取举报留言信息失败", error);
    }
  };

  const submitFeedback = async (page: number = 1) => {
    try {
      const response = await axiosConfig.get("/admin/feedback", {
        params: {
          currentPage: page,
          pageSize: feedbackPagination.value.pageSize, // 使用前端定义的分页大小
        },
      });

      // 更新分页信息
      feedbackPagination.value.total = response.data.data.pagination.total;
      feedbackPagination.value.currentPage =
        response.data.data.pagination.currentPage;
      feedbackPagination.value.pageSize =
        response.data.data.pagination.pageSize; // 同步后端返回的分页大小

      const feedbackList = response.data.data.feedbacks;
      const formattedFeedbacks = feedbackList.map((feedback: any) => ({
        ...feedback,
        formattedCreatedAt: new Date(feedback.createdAt).toLocaleString(
          "zh-CN",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }
        ),
      }));

      // 如果是第一页，替换数据；否则追加数据
      if (page === 1) {
        feedbacks.value = formattedFeedbacks;
      } else {
        feedbacks.value = [...feedbacks.value, ...formattedFeedbacks];
      }
    } catch (error) {
      console.error("获取建议与反馈信息失败", error);
    }
  };

  const loadMore = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    currentPage.value++;
    await getReportList(currentPage.value);
    await submitFeedback(currentPage.value);
    isLoading.value = false;
  };

  const refreshData = () => {
    currentPage.value = 1;
    getReportList(1);
    submitFeedback(1);
  };

  const currentReports = computed(() => {
    return reports.value;
  });

  const currentFeedbacks = computed(() => {
    return feedbacks.value;
  });

  onMounted(() => {
    if (contentSection.value) {
      contentSection.value.addEventListener("scroll", handleScroll);
    }
  });

  return {
    reports,
    currentFeedbacks,
    currentReports,
    getReportList,
    isLoading,
    contentSection,
    handleScroll,
    loadMore,
    currentPage,
    feedbacks,
    submitFeedback,
    refreshData,
  };
}
