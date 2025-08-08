<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="800px"
    append-to-body
    @opened="openDialog"
    :before-close="beforeClose"
  >
    <el-row>
      <el-col :span="12" style="height: 300px">
        <vue-cropper
          ref="cropper"
          :img="options.img"
          :info="true"
          :autoCrop="options.autoCrop"
          :autoCropWidth="options.autoCropWidth"
          :autoCropHeight="options.autoCropHeight"
          :fixedBox="options.fixedBox"
          :outputType="options.outputType"
          @realTime="realTime"
          v-if="showCropper"
        />
      </el-col>

      <el-col :span="12" style="height: 300px">
        <div class="preview-box-title">
          {{ previewTitle }}
        </div>
        <div class="preview-box">
          <img v-if="previews.url" :src="previews.url" :style="previews.img" />
          <span v-else></span>
        </div>
      </el-col>
    </el-row>
    <el-row style="margin-top: 12px">
      <el-col :span="12">
        <el-row>
          <el-col :span="8">
            <el-upload
              action="#"
              :http-request="() => {}"
              :before-upload="beforeUploadCropper"
              :show-file-list="false"
            >
              <el-button>{{ selectImageText }}</el-button>
            </el-upload>
          </el-col>
          <el-col :span="4">
            <el-button :title="zoomInText" :icon="Plus" @click="changeScale(1)">
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-button
              :title="zoomOutText"
              :icon="Minus"
              @click="changeScale(-1)"
            >
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-button
              :title="rotateLeftText"
              :icon="RefreshLeft"
              @click="rotateLeft()"
            >
            </el-button>
          </el-col>
          <el-col :span="4">
            <el-button
              :title="rotateRightText"
              :icon="RefreshRight"
              @click="rotateRight()"
            >
            </el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="4" :offset="8" style="margin-left: 22.3%">
        <el-button type="primary" @click="determine">{{
          confirmText
        }}</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VueCropper } from "vue-cropper";
import { ElMessage } from "element-plus";
import {
  Plus,
  Minus,
  RefreshLeft,
  RefreshRight,
} from "@element-plus/icons-vue";
import "vue-cropper/dist/index.css";

interface CropperInstance {
  getCropData: (callback: (data: string) => void) => void;
  changeScale: (num: number) => void;
  rotateLeft: () => void;
  rotateRight: () => void;
}

interface Props {
  title?: string;
  previewTitle?: string;
  selectImageText?: string;
  zoomInText?: string;
  zoomOutText?: string;
  rotateLeftText?: string;
  rotateRightText?: string;
  confirmText?: string;
  apiUrl?: string;
  userId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "裁剪头像",
  previewTitle: "预览头像",
  selectImageText: "选择图片",
  zoomInText: "放大",
  zoomOutText: "缩小",
  rotateLeftText: "向左旋转",
  rotateRightText: "向右旋转",
  confirmText: "确认裁剪",
  apiUrl: "",
  userId: "",
});

const emit = defineEmits(["update:modelValue", "cropped"]);

const dialogVisible = ref(false);
const showCropper = ref(false);
const cropper = ref<CropperInstance | null>(null);
const previews = ref({
  url: "",
  img: {},
});

const options = ref({
  img: null as string | null,
  autoCropWidth: 200,
  autoCropHeight: 200,
  outputType: "png",
  autoCrop: true,
  fixedBox: false,
});

// 打开裁剪弹窗
const openDialog = () => {
  showCropper.value = true;
};

// 修改图片大小
const changeScale = (num: number) => {
  num = num || 1;
  cropper.value?.changeScale(num);
};

// 旋转
const rotateLeft = () => {
  cropper.value?.rotateLeft();
};

const rotateRight = () => {
  cropper.value?.rotateRight();
};

// 实时预览
const realTime = (data: any) => {
  previews.value = data;
};

// 关闭弹窗
const beforeClose = () => {
  options.value.img = null;
  previews.value.url = "";
  dialogVisible.value = false;
};

// 打开裁剪对话框
const openCropper = (imageUrl: string) => {
  options.value.img = imageUrl;
  dialogVisible.value = true;
};

// 上传图片处理
const beforeUploadCropper = (rawFile: File) => {
  if (rawFile.type.indexOf("image/") === -1) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  const reader = new FileReader();
  reader.readAsDataURL(rawFile);
  reader.onload = () => {
    options.value.img = reader.result as string;
  };
  return false;
};

// 提交裁剪结果
const determine = async () => {
  try {
    if (!cropper.value || !props.userId) {
      ElMessage.error("缺少必要参数");
      return;
    }

    const croppedData = await new Promise<string>((resolve) => {
      cropper.value?.getCropData(resolve);
    });

    if (!croppedData) {
      ElMessage.error("裁剪数据获取失败");
      return;
    }

    let blob: Blob;
    if (typeof croppedData === "string" && croppedData.startsWith("blob:")) {
      blob = await fetch(croppedData).then((res) => res.blob());
    } else if (
      typeof croppedData === "string" &&
      croppedData.startsWith("data:image/")
    ) {
      const base64Response = await fetch(croppedData);
      blob = await base64Response.blob();
    } else {
      ElMessage.error("不支持的图像数据格式");
      return;
    }

    emit("cropped", blob);
    beforeClose();
  } catch (error: any) {
    const errorMessage = error?.message || "上传失败";
    ElMessage.error(errorMessage);
  }
};

defineExpose({
  openCropper,
});
</script>

<style scoped>
.preview-box {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px solid #ccc;
  overflow: hidden;
}

.preview-box-title {
  text-align: center;
  margin-left: 20px;
  color: #000;
}
</style>
