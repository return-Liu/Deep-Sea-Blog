<template>
  <div class="device-management">
    <div class="header-section">
      <h1 class="page-title">登录设备管理</h1>
      <p class="page-description">
        管理和监控所有已登录您账户的设备，确保只有您信任的设备可以访问您的账户。
      </p>
    </div>

    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <div class="card-header-left">
            <span class="card-title">已登录设备</span>
            <el-tag type="info" size="small" class="device-count">
              共 {{ (devices || []).length }} 台设备
            </el-tag>
            <el-tag type="warning" size="small" effect="dark" class="beta-tag">
              <el-icon><Warning /></el-icon>
              内测中
            </el-tag>
          </div>
          <el-button
            type="danger"
            @click="logoutAllDevices"
            :loading="loading"
            plain
          >
            <el-icon><SwitchButton /></el-icon>
            登出当前设备
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
              'trusted-device': device.isTrusted,
            }"
          >
            <div class="device-header">
              <div class="device-basic-info">
                <el-icon class="device-icon" :size="24">
                  <component :is="getDeviceIcon(device.deviceType)" />
                </el-icon>
                <div class="device-name-section">
                  <span class="device-name">{{
                    device.deviceName || "未知设备名称/平台"
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

              <el-tag
                :type="device.isTrusted ? 'success' : 'info'"
                size="small"
                class="trust-status"
              >
                {{ device.isTrusted ? "受信任" : "未信任" }}
              </el-tag>
            </div>

            <div class="device-details" @click="handleClick(device)">
              <div class="detail-row">
                <span class="detail-label">登录系统:</span>
                <span>{{ device.os || "未知登录系统" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录浏览器:</span>
                <span>{{ device.browser || "未知登录浏览器" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">登录参考地:</span>
                <span>{{ device.location || "未知登录参考地" }}</span>
              </div>
              <div
                class="detail-row"
                v-if="device.isTrusted && device.trustExpire"
              >
                <span class="detail-label">信任到期:</span>
                <span>{{ formatDate(device.trustExpire) }}</span>
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
                @click="trustDevice(device.id)"
                :type="device.isTrusted ? 'info' : 'primary'"
                :loading="device.actionLoading"
                round
              >
                {{ device.isTrusted ? "取消信任" : "设为信任" }}
              </el-button>
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

    <el-card class="security-card">
      <div class="security-header">
        <el-icon size="20" color="#409EFF"><Warning /></el-icon>
        <h3>安全提示</h3>
      </div>
      <ul class="security-tips">
        <li>定期检查登录设备，及时移除不使用的设备有助于保护账号安全</li>
        <li>受信任的设备在下次登录时无需验证</li>
        <li>如果发现异常设备，请立即登出并修改密码</li>
        <li>公共设备请勿设为信任，避免账号信息泄露</li>
        <li>设备信任有效期为30天，过期后需重新验证</li>
        <li>登出设备后，该设备的登录状态将立即失效</li>
      </ul>
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
const userStore = useUserStore();
const user = computed(() => userStore.user);
import {
  Monitor,
  Iphone,
  SwitchButton,
  Warning,
  Cellphone,
} from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";
import type { Device } from "../../types/device";

const devices = ref<Device[]>([]);
const loading = ref(false);
// 添加弹窗相关的状态
const modalVisible = ref(false);
const selectedDevice = ref<Device>({} as Device);

// 修改 handleClick 方法
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

    devices.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);
  } finally {
    loading.value = false;
  }
};

const trustDevice = async (deviceId: string) => {
  try {
    // 设置权限 只有管理员可以设置
    // 设置权限 只有管理员可以设置
    if (user.value?.id !== 4) {
      ElMessage.error("您没有权限进行此操作");
      return;
    }
    const device = devices.value.find((device: any) => device.id === deviceId);
    if (!device) return;

    device.actionLoading = true;
    const response = await axiosConfig.put(`/auth/devices/${deviceId}/trust`, {
      trusted: !device.isTrusted,
    });

    device.isTrusted = !device.isTrusted;
    ElMessage.success(response.data.message ? "操作成功" : "操作失败");
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
    await ElMessageBox.confirm(
      "确定要登出所有设备吗？您需要在所有设备上重新登录。",
      "确认登出",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

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
// 获取ip位置
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

    .page-description {
      font-size: 14px;
      color: var(--color-bg4);
      margin: 0;
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

          &.trusted-device {
            border-color: #67c23a; // 受信任设备绿色边框
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

  .security-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background: var(--bg1);

    .security-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--color-bg4);
      }
    }

    .security-tips {
      padding-left: 20px;
      margin: 0;

      li {
        margin-bottom: 8px;
        font-size: 14px;
        color: var(--color-bg4);
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
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
