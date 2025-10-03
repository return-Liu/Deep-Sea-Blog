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
  userAgent: string;
  lastActiveAt?: string; // 最后活跃时间
  loginExpire?: string; // 登录过期时间
}
