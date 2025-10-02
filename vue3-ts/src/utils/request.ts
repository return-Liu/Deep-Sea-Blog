import axios from "axios";
import Cookies from "js-cookie";
import { ElMessage } from "element-plus";
import { apiUrl } from "../config";
import { useRouter } from "vue-router";
const router = useRouter();
interface StatusHandler {
  [key: number]: () => void;
}

const axiosConfig = axios.create({
  baseURL: apiUrl,
  timeout: 5000,
});

axiosConfig.interceptors.request.use(
  (config) => {
    const token = Cookies.get("ds-token");
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosConfig.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    if (response) {
      // 原有的错误处理逻辑
      const statusHandlers: StatusHandler = {
        400: () => {
          ElMessage.error("请求错误");
        },
        401: handleTokenExpired,
        402: () => {
          ElMessage.error("请求失败");
        },
        404: () => {
          ElMessage.error("请求的资源不存在");
        },

        408: () => {
          ElMessage.error("请求超时");
        },
        500: () => {
          const isTokenExpired =
            error?.response?.data?.message.includes("token");
          if (isTokenExpired) {
            handleTokenExpired();
          } else {
            console.log(error);
          }
        },
      };
      const handler =
        statusHandlers[response.status as keyof StatusHandler] ||
        statusHandlers[400];
      handler();
    } else {
      ElMessage.error("网络错误，请检查您的网络连接");
    }

    return Promise.reject(error);
  }
);

// 统一处理 Token 失效逻辑
const handleTokenExpired = () => {
  ElMessage.error("登录已过期，请重新登录");
  Cookies.remove("ds-token");
  router.push("/login/index");
};

export default axiosConfig;
