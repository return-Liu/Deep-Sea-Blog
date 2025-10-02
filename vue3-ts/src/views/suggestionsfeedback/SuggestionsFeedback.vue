<template>
  <div class="feedback-container">
    <el-card class="feedback-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">意见反馈</span>
          <p class="card-subtitle">您的建议将帮助我们不断改进产品和服务</p>
        </div>
      </template>

      <div class="card-content">
        <el-form
          ref="feedbackFormRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          @submit.prevent="submitFeedback"
          class="feedback-form"
        >
          <el-row :gutter="24">
            <el-col :span="24" :md="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入您的姓名"
                  clearable
                  size="large"
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
                  size="large"
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
              resize="none"
            />
          </el-form-item>

          <el-form-item class="form-actions">
            <el-button
              type="primary"
              native-type="submit"
              :loading="isSubmitting"
              size="default"
            >
              {{ isSubmitting ? "提交中..." : "提交反馈" }}
            </el-button>
            <el-button @click="resetForm" size="default">重置</el-button>
          </el-form-item>
        </el-form>

        <transition name="fade">
          <div v-if="successMessage" class="status-message success">
            <el-result
              icon="success"
              title="提交成功"
              :sub-title="successMessage"
            />
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="status-message error">
            <el-result
              icon="error"
              title="提交失败"
              :sub-title="errorMessage"
            />
          </div>
        </transition>
      </div>
    </el-card>

    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">反馈须知</span>
        </div>
      </template>

      <div class="info-content">
        <ul class="info-list">
          <li class="info-item">
            <el-icon class="info-icon"><CircleCheck /></el-icon>
            <span>我们会认真阅读每一条反馈，并在处理后通过邮件回复您</span>
          </li>
          <li class="info-item">
            <el-icon class="info-icon"><CircleCheck /></el-icon>
            <span>请确保填写的邮箱地址正确，以便我们与您联系</span>
          </li>
          <li class="info-item">
            <el-icon class="info-icon"><CircleCheck /></el-icon>
            <span>反馈内容请尽量详细，有助于我们更好地理解您的需求</span>
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CircleCheck } from "@element-plus/icons-vue";
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
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.el-card) {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
}

.card-header {
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-bg4);
  }

  .card-subtitle {
    font-size: 14px;
    color: var(--color-bg4);
    margin: 6px 0 0;
  }
}

.feedback-card {
  color: var(--color-bg4);
  background: var(--bgColor1);
  .card-content {
    padding: 24px;

    .feedback-form {
      .form-actions {
        display: flex;
        justify-content: flex-start;
        gap: 12px;
        margin-top: 24px;

        :deep(.el-button) {
          min-width: 100px;
        }
      }
    }

    .status-message {
      margin-top: 24px;

      :deep(.el-result) {
        padding: 20px 0;

        .el-result__title {
          font-size: 18px;
          margin-top: 12px;
        }

        .el-result__subtitle {
          font-size: 14px;
          margin-top: 8px;
        }
      }
    }
  }
}

.info-card {
  background: var(--bgColor1);

  .info-content {
    padding: 8px 24px 24px;

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      color: var(--color-bg4);

      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 14px;
        color: var(--color-bg4);

        &:last-child {
          margin-bottom: 0;
        }

        .info-icon {
          color: #67c23a;
          font-size: 16px;
          margin-top: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .feedback-container {
    padding: 15px;
  }

  :deep(.el-card__header) {
    padding: 16px 20px;
  }

  .feedback-card {
    .card-content {
      padding: 20px;
    }
  }

  .el-col {
    &:nth-child(2n) {
      margin-top: 16px;
    }
  }
}
</style>
