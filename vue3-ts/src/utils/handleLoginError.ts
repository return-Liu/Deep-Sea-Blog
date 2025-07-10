import { ElMessage } from "element-plus";
export const handleLoginError = (error: any) => {
  if (error.response?.data) {
    const { errors } = error.response.data;
    if (errors?.length) {
      errors.forEach((msg: string) => ElMessage.error(msg));
    } else {
      ElMessage.error("登录失败：" + error.message);
    }
  } else {
    ElMessage.error("网络异常，请稍后再试");
  }
};
