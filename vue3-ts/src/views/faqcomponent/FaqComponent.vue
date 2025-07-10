<template>
  <div class="faq-container">
    <h2>常见问题解答（FAQ）</h2>
    <input
      type="text"
      v-model="searchQuery"
      placeholder="搜索问题"
      class="faq-search"
    />
    <div v-for="(faq, index) in filteredFaqs" :key="index" class="faq-item">
      <h3 @click="toggleAnswer(index)" class="faq-question">
        {{ faq.question }}
      </h3>
      <transition name="fade">
        <div v-if="faq.showAnswer" class="faq-answer">
          <p>{{ faq.answer }}</p>
        </div>
      </transition>
    </div>

    <!-- 反馈进度查询 -->
    <section class="user-feedback-status" v-if="userFeedbacks.length > 0">
      <h2>我的反馈进度</h2>
      <div class="feedback-status-list">
        <div
          v-for="(item, index) in userFeedbacks"
          :key="index"
          class="feedback-status-item"
        >
          <div class="status-header">
            <h3>{{ item.feedback }}</h3>
            <p class="status" :class="'status-' + item.status">
              {{ item.status }}
            </p>
          </div>
          <div class="status-content">
            <p>提交时间：{{ item.formattedCreatedAt }}</p>
            <p>处理状态：{{ item.status }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axiosConfig from "../../utils/request";

interface FaqItem {
  question: string;
  answer: string;
  showAnswer: boolean;
}

interface FeedbackItem {
  feedback: string;
  formattedCreatedAt: string;
  status: string;
}

const faqs = ref<FaqItem[]>([
  {
    question: "如何提交建议与反馈？",
    answer: "您可以在“建议与反馈”页面填写相关信息并提交。",
    showAnswer: false,
  },
  {
    question: "提交后多久能得到回复？",
    answer: "我们会在收到反馈后的24小时内进行处理并回复。",
    showAnswer: false,
  },
  {
    question: "反馈处理进度如何查看？",
    answer: "您可以在“我的反馈进度”页面查看反馈处理进度。",
    showAnswer: false,
  },
  {
    question: "如何查看反馈处理进度？",
    answer: "您可以在“我的反馈进度”页面查看反馈处理进度。",
    showAnswer: false,
  },
]);

const searchQuery = ref("");
const filteredFaqs = computed(() => {
  return faqs.value.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const toggleAnswer = (index: number) => {
  faqs.value[index].showAnswer = !faqs.value[index].showAnswer;
};

const userFeedbacks = ref<FeedbackItem[]>([]);

const getUserFeedbackStatus = async () => {
  try {
    const response = await axiosConfig.get("/admin/feedback");
    userFeedbacks.value = response.data.data.feedbacks;
  } catch (error) {
    console.error("获取反馈进度失败", error);
  }
};

onMounted(() => {
  getUserFeedbackStatus(); // 获取用户反馈进度
});
</script>

<style scoped>
.faq-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #eaf0f1 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.faq-search {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.faq-item {
  margin-bottom: 15px;
}

.faq-question {
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.faq-question:hover {
  color: #007bff;
}

.faq-answer {
  margin-top: 5px;
  padding-left: 15px;
  border-left: 3px solid #007bff;
}

.fade-enter-active,
.fade-leave-active {
  transition: max-height 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  max-height: 0;
}

.fade-enter-to,
.fade-leave-from {
  max-height: 100px;
}

.user-feedback-status {
  margin-top: 20px;
}

.feedback-status-list {
  display: flex;
  flex-direction: column;
}

.feedback-status-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content {
  margin-top: 10px;
}

.status-received {
  color: #ff9900;
}

.status-processing {
  color: #007bff;
}

.status-resolved {
  color: #28a745;
}
</style>
