<template>
  <el-image-viewer
    v-if="visible"
    :url-list="imageList"
    :initial-index="initialIndex"
    @close="close"
  />
</template>

<script setup lang="ts">
import { ElImageViewer } from "element-plus";
import { ref, watch } from "vue";

interface Props {
  visible: boolean;
  images: string | string[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const imageList = ref<string[]>([]);
const initialIndex = ref(0);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      imageList.value = Array.isArray(props.images)
        ? props.images
        : [props.images];
      initialIndex.value = props.initialIndex;
    }
  },
  { immediate: true }
);

const close = () => {
  emit("close");
};
</script>
