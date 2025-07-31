<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <component :is="MoblieComputerIcon" class="title-icon" />
          登录操作通知
        </h3>
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
              <h5>
                <span style="font-size: 20px">{{ device.deviceType }}</span
                >端的设备名称
              </h5>
              <h4 class="device-name">
                {{ device.deviceName || "未知登录设备名称/平台" }}
              </h4>
            </div>
          </div>
        </div>

        <div class="device-details-grid">
          <div class="detail-item">
            <div class="detail-label">
              <component :is="DeviceIdIcon" class="detail-icon" />
              <span>设备ID</span>
            </div>
            <div class="detail-value">
              {{ device.id || "未知登录设备id" }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">
              <component :is="DeviceTypeIcon" class="detail-icon" />
              <span>设备类型</span>
            </div>
            <div class="detail-value">
              {{ device.deviceType || "未知登录设备类型" }}
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">
              <component :is="UUIDIcon" class="detail-icon" />
              <span>UID</span>
            </div>
            <div class="detail-value">{{ user.uuid }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">
              <component :is="LoginTypeIcon" class="detail-icon" />
              <span>登录方式</span>
            </div>
            <div class="detail-value">{{ device.loginMethod }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">
              <component :is="LoginStautsIcon" class="detail-icon" />
              <span>登录状态</span>
            </div>
            <div class="detail-value">{{ device.status }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">
              <component :is="PperatingSystemIcon" class="detail-icon" />
              <span>操作系统</span>
            </div>
            <div class="detail-value">
              {{ device.os || "未知登录系统" }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <component :is="BrowerIcon" class="detail-icon" />
              <span>浏览器</span>
            </div>
            <div class="detail-value">
              {{ device.browser || "未知登录浏览器" }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <component :is="LocationIcon" class="detail-icon" />
              <span>参考登录地点</span>
            </div>
            <div class="detail-value">
              {{ device.province }}
              {{ device.location || "未知参考登录地点" }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <component :is="LastLoginIcon" class="detail-icon" />
              <span>最后登录</span>
            </div>
            <div class="detail-value">
              {{ formatDate(device.lastLoginTime) || "未知登录时间" }}
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="modal-footer notice-section">
        <p class="notice-text">
          <el-icon class="warning-icon"><Warning /></el-icon>
          温馨提示：设备信息可能存在延迟，实际情况请以当前设备状态为准
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { Device } from "../../types/device";
import BrowerIcon from "../../components/icon/Brower.vue";
import DeviceTypeIcon from "../../components/icon/DeviceType.vue";
import PperatingSystemIcon from "../../components/icon/PperatingSystem.vue";
import ComputerIcon from "../../components/icon/Computer.vue";
import MoblieComputerIcon from "../../components/icon/MoblieComputer.vue";
import UUIDIcon from "../../components/icon/Uuid.vue";
import LastLoginIcon from "../../components/icon/LastLogin.vue";
import LocationIcon from "../../components/icon/Location.vue";
import LoginTypeIcon from "../../components/icon/LoginType.vue";
import LoginStautsIcon from "../../components/icon/LoginStauts.vue";
import DeviceIdIcon from "../../components/icon/DeviceId.vue";
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();
const user = computed(() => userStore.user);
import {
  Close,
  Location,
  Clock,
  Timer,
  Iphone,
  Cellphone,
  Check,
  CircleClose,
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
      return ComputerIcon;
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
    display: flex;
    align-items: center;

    .title-icon {
      margin-right: 8px;
      font-size: 20px;
      color: var(--color-primary);
      cursor: pointer;
      width: 25px;
      height: 25px;
    }
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
  flex: 1;
  overflow-y: auto;
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

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-text-secondary);
      font-weight: 500;

      .detail-icon {
        font-size: 16px;
        color: var(--color-primary);
        width: 16px;
        height: 16px;
      }
    }

    .detail-value {
      text-align: right;
      color: var(--color-text-primary);
      max-width: 60%;
      word-break: break-word;
    }
  }
}

.notice-section {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  text-align: center;

  .notice-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #ff4d4f;

    .warning-icon {
      margin-right: 8px;
      font-size: 16px;
      color: #ff4d4f;
    }
  }
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

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    .detail-label {
      margin-bottom: 8px;
    }
  }
}
</style>
