<template>
  <div class="feedback-container">
    <div class="feedback-card">
      <!-- 简洁标题 -->
      <h2 class="feedback-title">意见反馈</h2>
      <p class="feedback-subtitle">您的建议将帮助我们改进</p>

      <!-- 反馈表单 -->
      <form @submit.prevent="submitFeedback" class="feedback-form">
        <!-- 姓名输入 -->
        <div class="form-group">
          <label for="name">姓名</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            @blur="validateName"
            :class="{ 'has-error': nameError }"
            placeholder="请输入您的姓名"
          />
          <p v-if="nameError" class="error-message">{{ nameError }}</p>
        </div>

        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            @blur="validateEmail"
            :class="{ 'has-error': emailError }"
            placeholder="请输入您的邮箱"
          />
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
        </div>

        <!-- 反馈内容 -->
        <div class="form-group">
          <label for="feedback">反馈内容</label>
          <textarea
            id="feedback"
            v-model="formData.feedback"
            @blur="validateFeedback"
            :class="{ 'has-error': feedbackError }"
            placeholder="请输入您的反馈意见"
            rows="5"
          ></textarea>
          <p v-if="feedbackError" class="error-message">{{ feedbackError }}</p>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <span v-if="!isSubmitting">提交反馈</span>
          <span v-else>提交中...</span>
        </button>
      </form>

      <!-- 状态提示 -->
      <div v-if="successMessage" class="status-message success">
        <p>{{ successMessage }}</p>
      </div>

      <div v-if="errorMessage" class="status-message error">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import axiosConfig from "../../utils/request";
import { ElMessage } from "element-plus";
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();
const user = computed(() => userStore.user);
const successMessage = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);
const nameError = ref("");
const emailError = ref("");
const feedbackError = ref("");

const formData = reactive({
  name: "",
  email: "",
  feedback: "",
});

const validateName = () => {
  if (!formData.name.trim()) {
    nameError.value = "请输入您的姓名";
    return false;
  }
  nameError.value = "";
  return true;
};

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    emailError.value = "请输入电子邮箱";
    return false;
  }
  if (!emailPattern.test(formData.email)) {
    emailError.value = "请输入有效的电子邮箱";
    return false;
  }
  emailError.value = "";
  return true;
};

const validateFeedback = () => {
  if (!formData.feedback.trim()) {
    feedbackError.value = "请填写您的反馈内容";
    return false;
  }
  if (formData.feedback.length < 10) {
    feedbackError.value = "反馈内容至少需要10个字符";
    return false;
  }
  feedbackError.value = "";
  return true;
};

const validateForm = () => {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isFeedbackValid = validateFeedback();
  return isNameValid && isEmailValid && isFeedbackValid;
};

const submitFeedback = async (event: Event) => {
  event.preventDefault(); // 可选，因为模板中已有 .prevent
  if (isSubmitting.value) return;

  if (!validateForm()) {
    return;
  }

  const userId = user.value?.id; // 确保 user 存在
  if (!userId) {
    ElMessage.error("用户未登录，无法提交反馈");
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await axiosConfig.post(`/admin/feedback/${userId}`, formData);
    ElMessage.success("反馈提交成功！");
    successMessage.value = "感谢您的宝贵意见！";

    // 清空表单
    formData.name = "";
    formData.email = "";
    formData.feedback = "";
  } catch (error) {
    ElMessage.error("提交反馈失败，请稍后再试");
    errorMessage.value = "提交过程中出现错误，请稍后再试。";
    console.error("Error submitting feedback:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="less" scoped>
@import "../../base-ui/suggestionsfeedback.less";
</style>
