<template>
  <div class="device-management">
    <div class="header-section">
      <h1 class="page-title">设备管理</h1>
      <p class="page-description">管理您的登录设备，保障账户安全</p>
    </div>

    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <div>
            <span class="card-title">已登录设备</span>
            <el-tag type="info" size="small" class="device-count">
              共 {{ devices.length }} 台设备
            </el-tag>
          </div>
          <el-button
            type="danger"
            @click="logoutAllDevices"
            :loading="loading"
            plain
          >
            <el-icon><SwitchButton /></el-icon>
            登出所有设备
          </el-button>
        </div>
      </template>

      <div
        v-loading="loading"
        element-loading-text="加载中..."
        class="devices-container"
      >
        <div v-if="devices.length === 0" class="empty-state">
          <el-icon size="48" color="#C0C4CC"><Monitor /></el-icon>
          <p>暂无设备信息</p>
        </div>

        <div v-else class="devices-grid">
          <el-card
            v-for="device in devices"
            :key="device.id"
            class="device-item"
            :class="{ 'current-device': device.isCurrentDevice }"
          >
            <div class="device-header">
              <div class="device-basic-info">
                <el-icon class="device-icon" :size="24">
                  <component :is="getDeviceIcon(device.deviceType)" />
                </el-icon>
                <div class="device-name-section">
                  <span class="device-name">{{ device.deviceName }}</span>
                  <el-tag
                    v-if="device.isCurrentDevice"
                    type="success"
                    size="small"
                    effect="dark"
                  >
                    当前设备
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

            <div class="device-details">
              <div class="detail-row">
                <span class="detail-label">系统:</span>
                <span>{{ device.os }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">浏览器:</span>
                <span>{{ device.browser }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">位置:</span>
                <span>{{ user.area || "未知" }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">最后登录:</span>
                <span>{{ formatDate(device.lastLoginTime) }}</span>
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
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Monitor,
  Iphone,
  SwitchButton,
  Warning,
  Cellphone,
} from "@element-plus/icons-vue";
import axiosConfig from "../../utils/request";
import { useUserStore } from "../../store/userStore";
import type { Device } from "../../types/device";

const userStore = useUserStore();
const user = computed(() => userStore.user);
const devices = ref<Device[]>([]); // 添加类型注解
const loading = ref(false);

onMounted(() => {
  fetchDevices();
});

// 获取设备图标
const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return Iphone;
    case "tablet":
      return Cellphone; // 使用已导入的 Cellphone 替代未导入的 Tablet
    default:
      return Monitor;
  }
};

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "未知";
  const date = new Date(dateString);
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
    devices.value = response.data.data;
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    ElMessage.error("获取设备列表失败");
  } finally {
    loading.value = false;
  }
};

const trustDevice = async (deviceId: string) => {
  try {
    const device = devices.value.find((device: any) => device.id === deviceId);
    if (!device) return;

    device.actionLoading = true;
    await axiosConfig.put(`/auth/devices/${deviceId}/trust`, {
      trusted: !device.isTrusted,
    });

    device.isTrusted = !device.isTrusted;
    ElMessage.success(`设备已${device.isTrusted ? "设为信任" : "取消信任"}`);
  } catch (error) {
    console.error("Failed to trust device:", error);
    ElMessage.error("操作失败");
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
    await axiosConfig.delete(`/auth/devices/${deviceId}`);
    devices.value = devices.value.filter(
      (device: any) => device.id !== deviceId
    );
    ElMessage.success("设备登出成功");
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to logout device:", error);
      ElMessage.error("设备登出失败");
    }
  } finally {
    const device = devices.value.find((device: any) => device.id === deviceId);
    if (device) {
      device.actionLoading = false;
    }
  }
};

const logoutAllDevices = async () => {
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
    await axiosConfig.post("/auth/login/device");
    ElMessage.success("已登出所有其他设备");
    fetchDevices();
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "未知错误";
    ElMessage.error(errorMessage);

    // 特定错误提示
    if (errorMessage.includes("UUID 已存在")) {
      ElMessage.warning("UUID 已存在，请稍后再试或清除缓存重试。");
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-management {
  padding: 24px;
  background: var(--bg1);
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

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

.device-card {
  margin-bottom: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border: none;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
  background: var(--bg1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header > div {
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

.devices-container {
  min-height: 300px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--color-bg4);
}

.empty-state p {
  margin-top: 16px;
  font-size: 14px;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}

.device-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.device-item:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.device-item.current-device {
  background: var(--bg1);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.device-basic-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.device-icon {
  color: #409eff;
  margin-top: 2px;
}

.device-name-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-bg4);
}

.trust-status {
  height: 24px;
  line-height: 22px;
}

.device-details {
  margin-bottom: 20px;
  color: var(--color-bg4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--color-bg4);
  width: 70px;
  flex-shrink: 0;
}

.device-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.security-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background: var(--bg1);
}

.security-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.security-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--color-bg4);
}

.security-tips {
  padding-left: 20px;
  margin: 0;
}

.security-tips li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-bg4);
  line-height: 1.5;
}

.security-tips li:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .device-management {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header > div {
    justify-content: space-between;
  }

  .devices-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .device-item {
    width: 100%;
  }
}
</style>
