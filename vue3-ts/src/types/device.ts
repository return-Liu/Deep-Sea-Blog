export interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  os: string;
  browser: string;
  lastLoginTime?: string;
  isCurrentDevice: boolean;
  actionLoading?: boolean;
  location?: string; // 设备位置
  province: string;
  loginMethod: string;
  status: string;
}
