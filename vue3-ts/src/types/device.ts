export interface Device {
  id: string;
  deviceName: string;
  deviceType: string; // e.g., 'mobile', 'tablet', 'desktop'
  os: string;
  browser: string;
  lastLoginTime?: string;
  isTrusted: boolean;
  isCurrentDevice: boolean;
  actionLoading?: boolean;
}
