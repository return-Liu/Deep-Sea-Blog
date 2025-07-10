<template>
  <div class="custom-theme">
    <h2>选择你喜欢的个性化皮肤 —— 展示青春与活力风格</h2>

    <div class="tab-container">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: activeTab === index }]"
        @click="changeTab(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="color-options">
      <div
        v-for="item in tabContents[activeTab].items"
        :key="item"
        :class="{ selected: selectedColor === item, 'color-box': true }"
        @click="applyColor(item)"
        @mouseover="hoveredImgUrl = item"
        @mouseout="hoveredImgUrl = null"
      >
        <template v-if="tabContents[activeTab].type === 'image'">
          <img :src="item" alt="Background Image" class="background-image" />
        </template>
        <template v-else>
          <div class="color-swatch" :style="{ backgroundColor: item }"></div>
        </template>

        <button
          v-show="hoveredImgUrl === item"
          class="start-button"
          @click.stop="useTheme(item)"
          :disabled="selectedColor === item"
        >
          {{ selectedColor === item ? "正在使用" : "立即使用" }}
        </button>
      </div>
      <!-- 自定义皮肤 根据用户上传的图片 -->
      <div
        class="add-option"
        @click="triggerFileInput"
        :title="'上传自定义皮肤'"
      >
        <span>+</span>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useThemeStore } from "../../store/themeStore";
const fileInput = ref<HTMLInputElement | null>(null);
const themeStore = useThemeStore();
const tabs = ["推荐"];
const activeTab = ref(0);
const user = ref<number | null>(null);

const changeTab = (index: number) => {
  activeTab.value = index;
};

const tabContents = ref([
  {
    type: "image",
    items: [
      "https://qzonestyle.gtimg.cn/qzone/qzactStatics/imgs/20171122191532_f2975b.jpg",
      "https://qzonestyle.gtimg.cn/qzone/qzactStatics/imgs/20171123181522_c48800.jpg",
      "https://qzonestyle.gtimg.cn/qzone/qzactStatics/imgs/20171122191630_ff8fef.jpg",
    ],
  },
]);

const selectedColor = ref<string | null>(null);
const hoveredImgUrl = ref<string | null>(null);

const applyColor = (value: string) => {
  selectedColor.value = value;

  if (value.startsWith("#")) {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = value;
    document.documentElement.style.setProperty("--bgColor1", value);
    if (user.value) {
      localStorage.setItem(`theme-${user.value}`, value);
    }
  } else {
    document.body.style.backgroundImage = `url(${value})`;
    document.body.style.backgroundSize = "100% 100%";
    document.body.style.backgroundRepeat = "no-repeat";
    document.documentElement.style.setProperty("--bgColor1", value);
  }
};

const useTheme = (imgUrl: string) => {
  selectedColor.value = imgUrl;
  themeStore.setCustomTheme(imgUrl);

  if (user.value) {
    localStorage.setItem(`theme-${user.value}`, imgUrl);
  }
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      selectedColor.value = imageUrl;

      // 立即应用新图片作为背景
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = "100% 100%";
      document.body.style.backgroundRepeat = "no-repeat";
      document.documentElement.style.setProperty("--bgColor1", imageUrl);
      document.documentElement.style.setProperty("--color-bg4", imageUrl);
      document.documentElement.style.setProperty("--color-bg3", imageUrl);
      themeStore.setCustomTheme(imageUrl);
    };
    reader.readAsDataURL(file);
  }
};
onMounted(() => {
  if (user.value) {
    const storedTheme = localStorage.getItem(`theme-${user.value}`);
    if (storedTheme) {
      selectedColor.value = storedTheme;
    }
  }
});
</script>

<style scoped lang="less">
// 设置主题颜色变量
@secondary-color: #666;
@primary-color: #409eff;
@hover-shadow: rgba(0, 0, 0, 0.1);
@color-bg2: #ebeef5;

.custom-theme {
  padding: 20px;
  color: var(--color-bg3);

  .tab-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .tab-item {
      padding: 10px 15px;
      cursor: pointer;
      color: @secondary-color;
      font-size: 16px;

      &.active {
        color: @primary-color;
        border-bottom: 2px solid @primary-color;
      }
    }
  }

  .color-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;

    .color-box {
      width: 220px;
      height: 170px;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      box-shadow: 0 2px 6px @hover-shadow;
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: scale(1.1);

        .start-button {
          opacity: 1;
          pointer-events: auto;
        }
      }

      .background-image {
        width: 200px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
      }

      .checkbox {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        accent-color: white;
        cursor: pointer;
      }

      .start-button {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translate(-50%, -200%);
        padding: 5px 10px;
        background-color: #fff;
        color: @primary-color;
        border: 1px solid @primary-color;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s, color 0.3s;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;

        &:hover {
          background-color: @primary-color;
          color: #fff;
        }
      }

      .color-swatch {
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }
    }

    .add-option {
      width: 200px;
      height: 170px;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      box-shadow: 0 2px 6px @hover-shadow;
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      font-size: 24px;
      color: #666;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}
</style>
