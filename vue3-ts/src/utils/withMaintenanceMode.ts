import { ElMessage } from "element-plus";
function withMaintenanceMode<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    ElMessage.warning("由于系统维护中，暂不支持该操作");
    return;
  }) as T;
}
export default withMaintenanceMode;
