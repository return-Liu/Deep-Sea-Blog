export interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  os: string;
  browser: string;
  lastLoginTime?: string;
  isTrusted: boolean;
  isCurrentDevice: boolean;
  actionLoading?: boolean;
  location?: string; // 设备位置
  trustExpire?: string; // 信任到期时间
}
