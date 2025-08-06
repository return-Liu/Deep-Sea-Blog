import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

export function useReportUser() {
  const reportReasons = [
    { value: "谩骂造谣", label: "谩骂造谣" },
    { value: "广告", label: "广告" },
    { value: "诈骗", label: "诈骗" },
    { value: "色情", label: "色情" },
    { value: "网络暴力", label: "网络暴力" },
    { value: "反动", label: "反动" },
    { value: "未成年不当行为", label: "未成年不当行为" },
    { value: "其他", label: "其他" },
  ];

  const showReportModal = ref(false);
  const reportReason = ref("");
  const reportDescription = ref("");
  const evidenceFiles = ref<Array<{ file: File; preview: string }>>([]);
  const submitting = ref(false);
  const canSubmit = computed(() => {
    return reportReason.value !== "" && reportDescription.value !== "";
  });

  const handleDescriptionInput = () => {
    if (reportDescription.value.length > 100) {
      reportDescription.value = reportDescription.value.substring(0, 100);
    }
  };
  const submitReport = async () => {
    // 验证是否可以提交
    if (!canSubmit.value) {
      ElMessage.warning("请选择举报原因并填写描述");
      return;
    }
    // 设置提交状态
    submitting.value = true;
    ElMessage.info("此功能正在开发中，请耐心等待");
  };

  const cancelReport = () => {
    showReportModal.value = false;
    reportReason.value = "";
    reportDescription.value = "";
    evidenceFiles.value = [];
    submitting.value = false;
  };
  return {
    reportReasons,
    showReportModal,
    reportReason,
    reportDescription,
    evidenceFiles,
    submitting,
    canSubmit,
    handleDescriptionInput,
    submitReport,
    cancelReport,
  };
}
