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

<style lang="less" scoped>
@import "../../base-ui/suggestionsfeedback.less";
</style>
