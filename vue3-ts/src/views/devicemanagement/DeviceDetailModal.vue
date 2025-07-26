<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>设备详情</h3>
        <button class="close-button" @click="closeModal">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="device-info-section">
          <div class="device-main-info">
            <el-icon class="device-main-icon" :size="40">
              <component :is="getDeviceIcon(device.deviceType)" />
            </el-icon>
            <div class="device-main-text">
              <h4 class="device-name">{{ device.deviceName }}</h4>
              <el-tag
                :type="device.isTrusted ? 'success' : 'info'"
                size="small"
              >
                {{ device.isTrusted ? "受信任" : "未信任" }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="device-details-grid">
          <div class="detail-item">
            <div class="detail-label">
              <el-icon class="detail-icon"><Monitor /></el-icon>
              <span>设备类型</span>
            </div>
            <div class="detail-value">{{ device.deviceType }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <el-icon class="detail-icon"><Platform /></el-icon>
              <span>操作系统</span>
            </div>
            <div class="detail-value">{{ device.os }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <el-icon class="detail-icon"><ChromeFilled /></el-icon>
              <span>浏览器</span>
            </div>
            <div class="detail-value">{{ device.browser }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <el-icon class="detail-icon"><Location /></el-icon>
              <span>位置</span>
            </div>
            <div class="detail-value">{{ device.location || "未知位置" }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <el-icon class="detail-icon"><Clock /></el-icon>
              <span>最后登录</span>
            </div>
            <div class="detail-value">
              {{ formatDate(device.lastLoginTime) }}
            </div>
          </div>

          <div
            v-if="device.isTrusted && device.trustExpire"
            class="detail-item"
          >
            <div class="detail-label">
              <el-icon class="detail-icon"><Timer /></el-icon>
              <span>信任到期</span>
            </div>
            <div class="detail-value">{{ formatDate(device.trustExpire) }}</div>
          </div>
        </div>
      </div>
      <!-- 提示信息 -->
      <div class="modal-footer">
        <p class="notice-text">
          注意：设备信息可能存在延迟，仅供参考，请以当前设备实际状态为准。
        </p>
      </div>
      <div class="modal-footer">
        <el-button @click="closeModal">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Device } from "../../types/device";
import {
  Close,
  Monitor,
  Platform,
  ChromeFilled,
  Location,
  Clock,
  Timer,
  Iphone,
  Cellphone,
} from "@element-plus/icons-vue";

const props = defineProps<{
  modelValue: boolean;
  device: Device;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
const closeModal = () => {
  emit("close");
  emit("update:modelValue", false);
};

const handleOverlayClick = () => {
  closeModal();
};

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return Iphone;
    case "tablet":
      return Cellphone;
    default:
      return Monitor;
  }
};

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return "未知";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "未知";

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
</script>

<style lang="less" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background: var(--bg1);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-bg4);
  }
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--color-bg4);
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--bg2);
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.device-info-section {
  margin-bottom: 24px;
}

.device-main-info {
  display: flex;
  align-items: center;
  gap: 16px;

  .device-main-icon {
    color: #409eff;
  }

  .device-main-text {
    .device-name {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--color-bg4);
    }
  }
}

.device-details-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0; /* 增加顶部和底部的内边距 */
  border-bottom: 1px solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  .detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-bg4);
    font-weight: 500;

    .detail-icon {
      font-size: 16px; /* 统一图标大小 */
      color: #409eff; /* 统一图标颜色 */
    }
  }

  .detail-value {
    text-align: right;
    color: var(--color-bg4);
    max-width: 60%;
    word-break: break-word;
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;

  .el-button {
    min-width: 80px;
  }
}

.notice-text {
  font-weight: bold; /* 加粗文本 */
  color: #ff4d4f; /* 更显眼的颜色 */
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .modal-body {
    padding: 16px;
  }

  .device-main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
