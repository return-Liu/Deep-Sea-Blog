import { ref, computed, onMounted } from "vue";
import axiosConfig from "../utils/request";
export function useGeneral() {
  let currentPage = ref(1);
  const isLoading = ref(false);
  const contentSection = ref<HTMLElement | null>(null);
  const reports = ref<any[]>([]);
  const feedbacks = ref<any[]>([]);
  const handleScroll = () => {
    if (!contentSection.value) return;
    const scrollTop = contentSection.value.scrollTop;
    const clientHeight = contentSection.value.clientHeight;
    const scrollHeight = contentSection.value.scrollHeight;
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value) {
      loadMore();
    }
  };
  const getReportList = async (currentPage: number = 1) => {
    try {
      const response = await axiosConfig.get("/admin/wall/report");
      const reportList = response.data.data.reports;
      reports.value = reportList.map((report: any) => {
        console.log(report); // 添加调试信息
        return {
          ...report,
          formattedCreatedAt: new Date(report.createdAt).toLocaleString(
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
        };
      });
    } catch (error) {
      console.error("获取举报留言信息失败", error);
    }
  };
  const submitFeedback = async (currentPage: number = 1) => {
    try {
      const response = await axiosConfig.get("/admin/feedback");
      const feedbackList = response.data.data.feedbacks;
      feedbacks.value = feedbackList.map((feedback: any) => ({
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
    } catch (error) {
      console.error("获取建议与反馈信息失败", error);
    }
  };
  const loadMore = async () => {
    if (isLoading.value) return; // 如果正在加载，直接返回
    isLoading.value = true;
    currentPage.value++;
    await getReportList(currentPage.value);
    isLoading.value = false;
  };
  // 计算当前页内容
  const currentContent = computed(() => {
    let content: any[] = [];
    if (reports.value.length > 0 || feedbacks.value.length > 0) {
      content = reports.value.slice(0, currentPage.value * 6);
      content = feedbacks.value.slice(0, currentPage.value * 6);
    }
    return content;
  });
  onMounted(() => {
    if (contentSection.value) {
      contentSection.value.addEventListener("scroll", handleScroll);
    }
  });
  return {
    reports,
    currentContent,
    getReportList,
    isLoading,
    contentSection,
    handleScroll,
    loadMore,
    currentPage,
    feedbacks,
    submitFeedback,
  };
}
