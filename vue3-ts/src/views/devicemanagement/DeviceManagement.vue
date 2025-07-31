<template>
  <div class="device-management">
    <div class="header-section">
      <h1 class="page-title">登录设备管理</h1>
      <el-tag>账号情况</el-tag>
      <p class="page-status">
        <component :is="LoginStautsIcon" class="detail-icon" />
        <span
          v-for="device in devices.filter((d) => d.isCurrentDevice)"
          :key="device.id"
        >
          {{ currentDeviceStatus }}
        </span>
      </p>
      <p class="page-description">
        尊贵的用户，您的账号目前{{
          currentDeviceStatus
        }}，请继续保持。请妥善保管账号，建议移除不常用，非自用设备。
      </p>
    </div>
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-title">
              登录设备情况
              <span class="card-title-tip">
                <strong>状态存在一定延时</strong>
              </span>
            </span>
            <el-tag type="info" size="small" class="device-count">
              共 {{ (devices || []).length }} 台设备
            </el-tag>
            <el-tag type="warning" size="small" effect="dark" class="beta-tag">
              <el-icon><Warning /></el-icon>
              内测中
            </el-tag>
            <!-- 主设备 -->
          </div>
          <el-button
            type="primary"
            @click="logoutAllDevices"
            :loading="loading"
            plain
          >
            <el-icon><Refresh /></el-icon>
            刷新当前设备
          </el-button>
        </div>
      </template>

      <div
        v-loading="loading"
        element-loading-text="加载中..."
        class="devices-container"
      >
        <div v-if="(devices || []).length === 0" class="empty-state">
          <el-icon size="48" color="#C0C4CC"><Monitor /></el-icon>
          <p>暂无设备信息</p>
        </div>

        <div v-else class="devices-grid">
          <el-card
            v-for="device in devices"
            :key="device.id"
            class="device-item"
            :class="{
              'current-device': device.isCurrentDevice,
            }"
          >
            <div class="device-header">
              <div class="device-basic-info">
                <el-icon class="device-icon" :size="24">
                  <component :is="getDeviceIcon(device.deviceType)" />
                </el-icon>
                <div class="device-name-section">
                  <span class="device-name">{{
                    device.deviceName || "未知登录设备名称/平台"
                  }}</span>
                  <el-tag
                    v-if="device.isCurrentDevice"
                    type="success"
                    size="small"
                    effect="dark"
                  >
                    当前设备/平台
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="device-details" @click="handleClick(device)">
              <div class="detail-row">
                <span class="detail-label">UID</span>
                <span>{{ user.uuid }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录方式</span>
                <span>{{ device.loginMethod || "未知登录方式" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录系统:</span>
                <span>{{ device.os || "未知登录系统" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录浏览器:</span>
                <span>{{ device.browser || "未知登录浏览器" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">参考登录地点:</span>
                <span
                  >{{ device.province }}
                  {{ device.location || "未知参考登录地点" }}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">登录状态:</span>
                <span>{{ device.status || "未知设备状态" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录时间:</span>
                <span>{{
                  formatDate(device.lastLoginTime) || "未知登录时间"
                }}</span>
              </div>
            </div>
            <div class="device-actions">
              <el-button
                size="small"
                type="danger"
                @click="logoutDevice(device.id)"
                :disabled="device.isCurrentDevice"
                :loading="device.actionLoading"
                v-if="!device.isCurrentDevice"
                round
              >
                登出设备
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <DeviceDetailModal
      v-model="modalVisible"
      :device="selectedDevice"
      @close="modalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "../../store/userStore";
import DeviceDetailModal from "./DeviceDetailModal.vue";
import LoginStautsIcon from "../../components/icon/LoginStauts.vue";
const userStore = useUserStore();
const user = computed(() => userStore.user);
import { Monitor, Iphone, Warning, Cellphone } from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";
import type { Device } from "../../types/device";

const devices = ref<Device[]>([]);
const loading = ref(false);
const modalVisible = ref(false);
const selectedDevice = ref<Device>({} as Device);

const handleClick = (device: Device) => {
  selectedDevice.value = device;
  modalVisible.value = true;
};
onMounted(() => {
  fetchDevices();
});

// 获取设备图标
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
  if (isNaN(date.getTime())) return "未知"; // 检查日期是否有效

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
const fetchDevices = async () => {
  try {
    loading.value = true;
    const response = await axiosConfig.get("/auth/devices");
    console.log(response);
    devices.value = response.data.data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const logoutDevice = async (deviceId: string) => {
  try {
    const device = devices.value.find((device: any) => device.id === deviceId);
    if (!device) return;

    await ElMessageBox.confirm(
      `确定要登出设备 "${device.deviceName}" 吗？`,
      "确认登出",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    device.actionLoading = true;
    const response = await axiosConfig.delete(`/auth/devices/${deviceId}`);
    devices.value = devices.value.filter(
      (device: any) => device.id !== deviceId
    );
    fetchDevices(); // 刷新设备列表
    ElMessage.success(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    const device = devices.value.find((device: any) => device.id === deviceId);
    if (device) {
      device.actionLoading = false;
    }
  }
};
const logoutAllDevices = async () => {
  if ((devices.value || []).length === 0) {
    ElMessage.info("暂无设备信息");
    return;
  }
  try {
    await ElMessageBox.confirm("确定要刷新当前设备列表吗？", "确认刷新", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    loading.value = true;
    const response = await axiosConfig.post("/auth/login/device");
    ElMessage.success(response.data.message);
    fetchDevices();
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};
const currentDeviceStatus = computed(() => {
  const currentDevice = devices.value.find((d) => d.isCurrentDevice);
  return currentDevice ? (currentDevice.status ? "正常" : "异常") : "未知";
});
</script>

<style lang="less" scoped>
.device-management {
  padding: 24px;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  :deep(.el-card__body) {
    background: var(--bg1);
  }
  .header-section {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-bg4);
      margin: 0 0 8px 0;
    }
    .page-status {
      display: flex;
      margin: 10px;
    }
    .detail-icon {
      font-size: 20px;
      color: var(--color-primary);
      width: 20px;
      height: 20px;
    }
  }

  .device-card {
    margin-bottom: 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border: none;
    cursor: pointer;
    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: var(--border);
      background: var(--bg1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .card-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-bg4);
      }
      .card-title-tip {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-bg4);
      }

      .device-count {
        height: 20px;
        line-height: 18px;
      }
    }

    .devices-container {
      min-height: 300px;

      .empty-state {
        text-align: center;
        padding: 60px 0;
        color: var(--color-bg4);

        p {
          margin-top: 16px;
          font-size: 14px;
        }
      }

      .devices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
        padding: 20px;

        .device-item {
          border: 2px solid transparent; // 默认透明边框
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
          }

          &.current-device {
            background: var(--bg1);
            border-color: #409eff; // 当前设备蓝色边框
            box-shadow: 0 0 0 1px #409eff;
          }

          // 同时是当前设备和受信任设备时，优先显示当前设备边框
          &.current-device.trusted-device {
            border-color: #409eff;
          }

          .device-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;

            .device-basic-info {
              display: flex;
              align-items: flex-start;
              gap: 12px;

              .device-icon {
                color: #409eff;
                margin-top: 2px;
              }

              .device-name-section {
                display: flex;
                flex-direction: column;
                gap: 6px;

                .device-name {
                  font-size: 16px;
                  font-weight: 500;
                  color: var(--color-bg4);
                }
              }
            }

            .trust-status {
              height: 24px;
              line-height: 22px;
            }
          }

          .device-details {
            margin-bottom: 20px;
            color: var(--color-bg4);

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-label {
                color: var(--color-bg4);
                width: 90px;
                flex-shrink: 0;
              }
            }
          }

          .device-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .page-title {
      font-size: 24px;
    }

    .card-header {
      flex-direction: column;
      align-items: stretch;

      .card-header-left {
        justify-content: space-between;
      }
    }

    .devices-grid {
      grid-template-columns: 1fr;
      padding: 16px;

      .device-item {
        width: 100%;

        .device-id {
          flex-direction: column;
          gap: 4px;

          .device-id-value {
            text-align: left;
          }
        }
      }
    }
  }
}
</style>
