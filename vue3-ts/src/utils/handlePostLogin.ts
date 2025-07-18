import Cookies from "js-cookie";
import { ElMessage } from "element-plus";
import { handleLoginSuccess } from "./handleLoginSuccess";
import axiosConfig from "./request";

/**
 * 登录后处理逻辑
 * @param response - 登录接口返回数据
 * @param localeValue - 当前语言环境
 * @param router - Vue Router 实例
 */
export const handlePostLogin = async (
  response: any,
  localeValue: string,
  router: any
) => {
  // 设置 token
  Cookies.set("ds-token", response.data.data.token);

  // 显示成功提示
  ElMessage.success(response.data.message);

  // 获取用户信息
  const user = (await axiosConfig.get("/users/me")).data.data;

  // 调用登录成功处理函数
  handleLoginSuccess(user, { value: localeValue }, router);

  // 跳转首页
  router.push("/home");
};
