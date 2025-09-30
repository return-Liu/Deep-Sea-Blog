import axios from "axios";
import Cookies from "js-cookie";
import { ElMessage } from "element-plus";
import { apiUrl } from "../config";

interface StatusHandler {
  [key: number]: () => void;
}

// 创建一个Map来存储刷新中的请求，避免重复刷新
const refreshingTokens = new Map();

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
    const { response, config } = error;

    // 检查是否是头像URL请求失败且是因为签名过期
    if (
      response?.status === 403 &&
      config.url.includes("oss.aliyuncs.com") &&
      config.url.includes("avatar/") &&
      !config._retry
    ) {
      try {
        config._retry = true;

        // 从URL中提取文件名
        const urlObj = new URL(config.url);
        const filename = urlObj.pathname.split("avatar/")[1];

        if (filename && !isDefaultAvatar(filename)) {
          // 获取新的签名URL
          const newSignedUrl = await refreshAvatarSignature(filename);

          if (newSignedUrl) {
            // 更新请求配置中的URL
            config.url = newSignedUrl;
            // 重新发起请求
            return axiosConfig(config);
          }
        }
      } catch (refreshError) {
        console.error("刷新头像签名失败:", refreshError);
        // 刷新失败，返回默认头像
        return Promise.reject(new Error("头像加载失败"));
      }
    }

    // 原有的错误处理逻辑
    if (response) {
      const statusHandlers: StatusHandler = {
        400: () => {
          ElMessage.error("请求错误");
        },
        401: handleTokenExpired,
        402: () => {
          ElMessage.error("请求失败");
        },
        404: () => {
          // 如果是头像请求404，尝试使用默认头像
          if (config.url.includes("avatar/")) {
            console.warn("头像资源不存在，使用默认头像");
            // 这里可以返回一个模拟的成功响应，包含默认头像URL
            const mockResponse = {
              data: {},
              status: 200,
              statusText: "OK",
              headers: {},
              config: config,
            };
            return Promise.resolve(mockResponse);
          } else {
            ElMessage.error("请求的资源不存在");
          }
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

// 判断是否为默认头像
const isDefaultAvatar = (filename: string): boolean => {
  return (
    filename.includes("defaultAvatar") ||
    filename.includes("9/c2/f0ee8a3c7c9638a54940382568c9dpng.png")
  );
};

// 刷新头像签名URL
const refreshAvatarSignature = async (
  filename: string
): Promise<string | null> => {
  try {
    // 检查是否已经在刷新中，避免重复请求
    if (refreshingTokens.has(filename)) {
      return refreshingTokens.get(filename);
    }

    const promise = axiosConfig
      .get(`${apiUrl}/admin/uploadavatar/avatar/sign?filename=${filename}`)
      .then((response) => {
        return response.data.data.url;
      })
      .finally(() => {
        // 请求完成后从Map中移除
        refreshingTokens.delete(filename);
      });

    // 将Promise存储到Map中
    refreshingTokens.set(filename, promise);

    return await promise;
  } catch (error) {
    console.error("刷新头像签名失败:", error);
    refreshingTokens.delete(filename);
    return null;
  }
};

// 统一处理 Token 失效逻辑
const handleTokenExpired = () => {
  ElMessage.error("登录已过期，请重新登录");
  Cookies.remove("ds-token");
  // 注意：这里不能直接使用useRouter，因为这是在axios配置文件中
  // 应该通过重定向到登录页
  window.location.href = "/login/index";
};

export default axiosConfig;
