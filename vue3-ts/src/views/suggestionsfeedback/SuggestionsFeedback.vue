<template>
  <div class="feedback-container">
    <div class="feedback-header">
      <h1 class="page-title">意见反馈</h1>
      <p class="page-subtitle">您的建议将帮助我们不断改进</p>
    </div>

    <el-card class="feedback-card" shadow="hover">
      <div class="card-content">
        <el-form
          ref="feedbackFormRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          @submit.prevent="submitFeedback"
          class="feedback-form"
        >
          <el-row :gutter="20">
            <el-col :span="24" :md="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入您的姓名"
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :span="24" :md="12">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="formData.email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="反馈内容" prop="feedback">
            <el-input
              v-model="formData.feedback"
              type="textarea"
              :rows="6"
              placeholder="请详细描述您的建议或遇到的问题"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button
                type="primary"
                native-type="submit"
                :loading="isSubmitting"
                size="large"
                class="submit-btn"
              >
                {{ isSubmitting ? "提交中..." : "提交反馈" }}
              </el-button>
              <el-button @click="resetForm" size="large">重置</el-button>
            </div>
          </el-form-item>
        </el-form>

        <div v-if="successMessage" class="status-message success">
          <el-result
            icon="success"
            title="提交成功"
            :sub-title="successMessage"
          />
        </div>

        <div v-if="errorMessage" class="status-message error">
          <el-result icon="error" title="提交失败" :sub-title="errorMessage" />
        </div>
      </div>
    </el-card>

    <div class="feedback-info">
      <h3 class="info-title">反馈须知</h3>
      <ul class="info-list">
        <li class="info-item">
          <el-icon><InfoFilled /></el-icon>
          <span>我们会认真阅读每一条反馈，并在处理后通过邮件回复您</span>
        </li>
        <li class="info-item">
          <el-icon><InfoFilled /></el-icon>
          <span>请确保填写的邮箱地址正确，以便我们与您联系</span>
        </li>
        <li class="info-item">
          <el-icon><InfoFilled /></el-icon>
          <span>反馈内容请尽量详细，有助于我们更好地理解您的需求</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";

// 类型定义
interface FeedbackForm {
  name: string;
  email: string;
  feedback: string;
}

// 组合式 API
const userStore = useUserStore();
const user = computed(() => userStore.user);
const feedbackFormRef = ref<FormInstance>();

// 状态管理
const successMessage = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

// 表单数据
const formData = reactive<FeedbackForm>({
  name: "",
  email: "",
  feedback: "",
});

// 表单规则
const formRules = reactive<FormRules>({
  name: [
    { required: true, message: "请输入您的姓名", trigger: "blur" },
    {
      min: 2,
      max: 20,
      message: "姓名长度应在 2 到 20 个字符之间",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入您的邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  feedback: [
    { required: true, message: "请填写您的反馈内容", trigger: "blur" },
    { min: 10, message: "反馈内容至少需要 10 个字符", trigger: "blur" },
    { max: 1000, message: "反馈内容不能超过 1000 个字符", trigger: "blur" },
  ],
});

// 方法定义
const resetForm = () => {
  ElMessageBox.confirm(
    "确定要重置表单吗？所有已填写的内容将被清除。",
    "确认重置",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      feedbackFormRef.value?.resetFields();
      successMessage.value = "";
      errorMessage.value = "";
      ElMessage.info("表单已重置");
    })
    .catch(() => {
      ElMessage.info("取消重置");
    });
};

const submitFeedback = async () => {
  if (isSubmitting.value) return;

  try {
    const valid = await feedbackFormRef.value?.validate();
    if (!valid) return;

    const userId = user.value?.id;
    if (!userId) {
      ElMessage.error("用户未登录，无法提交反馈");
      return;
    }

    isSubmitting.value = true;
    successMessage.value = "";
    errorMessage.value = "";

    await axiosConfig.post(`/admin/feedback/${userId}`, formData);

    successMessage.value =
      "感谢您的宝贵意见！我们会在 3 个工作日内处理您的反馈并通过举报结果中心回复您。";
    feedbackFormRef.value?.resetFields();

    ElMessage.success("反馈提交成功！");
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "提交反馈失败，请稍后再试";
    errorMessage.value = errorMsg;
    ElMessage.error(errorMsg);
    console.error("Error submitting feedback:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.feedback-container {
  margin: 0 auto;
  padding: 20px;

  .feedback-header {
    text-align: center;
    margin-bottom: 30px;

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 10px;
    }

    .page-subtitle {
      font-size: 16px;
      color: #606266;
      margin: 0;
    }
  }

  .feedback-card {
    border-radius: 8px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    :deep(.el-card__body) {
      padding: 30px;
    }

    .card-content {
      .feedback-form {
        .form-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;

          .submit-btn {
            min-width: 120px;
          }
        }
      }

      .status-message {
        margin-top: 20px;

        :deep(.el-result) {
          padding: 20px 0;

          .el-result__title {
            font-size: 20px;
            margin-top: 15px;
          }

          .el-result__subtitle {
            font-size: 14px;
            margin-top: 10px;
          }
        }
      }
    }
  }

  .feedback-info {
    margin-top: 30px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .info-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
      margin: 0 0 15px;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #606266;

        &:last-child {
          margin-bottom: 0;
        }

        .el-icon {
          color: #409eff;
          font-size: 16px;
          margin-top: 2px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .feedback-container {
    padding: 15px;

    .feedback-header {
      .page-title {
        font-size: 24px;
      }
    }

    .feedback-card {
      :deep(.el-card__body) {
        padding: 20px;
      }
    }

    .feedback-info {
      padding: 15px;
    }
  }
}
</style>
