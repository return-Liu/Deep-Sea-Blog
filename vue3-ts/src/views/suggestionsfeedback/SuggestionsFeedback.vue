<template>
  <div class="suggestions-feedback">
    <div class="feedback-container">
      <h1 class="title">建议与反馈</h1>
      <p class="subtitle">你的反馈对我们很重要</p>

      <form @submit.prevent="submitFeedback" class="feedback-form">
        <div class="form-group">
          <label for="name">姓名</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            :class="{ 'input-filled': formData.name }"
            placeholder="请输入你的姓名"
          />
          <p v-if="nameError" class="error-text">{{ nameError }}</p>
        </div>

        <div class="form-group">
          <label for="email">电子邮件</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            :class="{ 'input-filled': formData.email }"
            placeholder="请输入你的邮箱"
          />
          <p v-if="emailError" class="error-text">{{ emailError }}</p>
        </div>

        <div class="form-group">
          <label for="feedback">建议与反馈</label>
          <textarea
            id="feedback"
            v-model="formData.feedback"
            :class="{ 'input-filled': formData.feedback }"
            placeholder="请详细描述你的建议或反馈..."
            rows="5"
          ></textarea>
          <p v-if="feedbackError" class="error-text">{{ feedbackError }}</p>
        </div>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "提交中..." : "提交反馈" }}
        </button>
      </form>

      <transition name="fade">
        <div v-if="successMessage" class="success-message">
          <i class="success-icon">✓</i>
          {{ successMessage }}
        </div>
      </transition>

      <transition name="fade">
        <div v-if="errorMessage" class="error-message">
          <i class="error-icon">✕</i>
          {{ errorMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import axiosConfig from "../../utils/request";
import { ElMessage } from "element-plus";
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
  if (!formData.name) {
    nameError.value = "姓名不能为空";
    return false;
  }
  nameError.value = "";
  return true;
};

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    emailError.value = "电子邮件不能为空";
    return false;
  }
  if (!emailPattern.test(formData.email)) {
    emailError.value = "电子邮件格式不正确";
    return false;
  }
  emailError.value = "";
  return true;
};

const validateFeedback = () => {
  if (!formData.feedback) {
    feedbackError.value = "反馈内容不能为空";
    return false;
  }
  feedbackError.value = "";
  return true;
};

const validateForm = () => {
  return validateName() && validateEmail() && validateFeedback();
};

const submitFeedback = async () => {
  if (isSubmitting.value) return;

  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  try {
    await axiosConfig.post("/admin/feedback", formData);
    ElMessage.success("反馈提交成功！");
    successMessage.value = "感谢你的反馈，我们会尽快处理！";
    // 清空表单数据
    formData.name = "";
    formData.email = "";
    formData.feedback = "";
  } catch (error) {
    ElMessage.error("提交反馈失败，请稍后再试。");
    console.error("Error submitting feedback:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<style scoped>
@import "../../base-ui/suggestionsfeedback.less";
</style>
