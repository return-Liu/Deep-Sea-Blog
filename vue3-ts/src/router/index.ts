import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from "vue-router";
import routerConfig from "./config";
import Cookies from "js-cookie";
import NProgress from "nprogress";
import axiosConfig from "../utils/request";
import { useUserStore } from "../store/userStore";
import type { AxiosError } from "axios";

// 公共页面路径
const PUBLIC_PATHS = [
  "/login/index",
  "/resetpassword",
  "/userprotocol",
  "/privacy",
];

// 权限配置 - 定义各角色可访问的路径
const PERMISSION_CONFIG = {
  admin: ["/freezemanagement"],
  // 可以轻松添加其他角色和对应路径
};

// 获取路径需要的角色
function getRequiredRole(path: string): string | null {
  for (const [role, paths] of Object.entries(PERMISSION_CONFIG)) {
    if (paths.includes(path)) {
      return role;
    }
  }
  return null;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/login/index",
    },
    {
      path: "/layout",
      name: "layout",
      component: () => import("../views/layout/Layout.vue"),
    },
    {
      path: "/login/index",
      name: "login",
      component: () => import("../views/login/Login.vue"),
    },
    {
      path: "/resetpassword",
      name: "resetpassword",
      component: () => import("../views/resetpassword/ResetPassword.vue"),
    },
    {
      path: "/userprotocol",
      name: "UserProtocol",
      meta: { requiresAuth: false },
      component: () => import("../views/userprotocol/UserProtocol.vue"),
    },
    {
      path: "/privacy",
      name: "Privacy",
      meta: { requiresAuth: false },
      component: () => import("../views/privacy/Privacy.vue"),
    },
  ],
});

let isDynamicRoutesAdded = false;

async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = Cookies.get("/auth/ds-refresh-token");
    if (!refreshToken) return null;

    const response = await axiosConfig.post("/auth/refresh", {
      refreshToken,
    });

    const { token } = response.data;
    Cookies.set("ds-token", token, { expires: 7 }); // 设置新 token
    return token;
  } catch (error) {
    console.error("刷新 token 失败:", error);
    return null;
  }
}

// 验证token是否有效
async function validateToken(token: string): Promise<boolean> {
  try {
    await axiosConfig.get("/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (error) {
    // 尝试刷新 token
    const newToken = await refreshToken();
    if (newToken) {
      // 刷新成功，重新验证
      return await validateToken(newToken);
    }
    return false;
  }
}

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const token = Cookies.get("ds-token");
  const isPublicPath = PUBLIC_PATHS.includes(to.path);
  const isLoginPath = to.path === "/login/index";
  const isFromResetPass = from.path === "/resetpassword";

  // 1. 动态路由添加逻辑
  if (token && !isDynamicRoutesAdded && !isLoginPath) {
    try {
      const isTokenValid = await validateToken(token);
      if (isTokenValid) {
        routerConfig.forEach((route) => {
          router.addRoute("layout", route);
        });
        isDynamicRoutesAdded = true;

        // 重新导航到当前路径以确保路由生效
        next({ ...to, replace: true });
        return;
      }
    } catch (error) {
      console.error("添加动态路由失败:", error);
    }
  }

  // 2. 公共路径处理
  if (isPublicPath) {
    if (isFromResetPass && isLoginPath) {
      Cookies.remove("ds-token");
      isDynamicRoutesAdded = false;
      next();
      return;
    }

    if (token && isLoginPath) {
      // 已登录用户访问登录页，跳转到首页
      next({ path: "/home", replace: true });
      return;
    }

    next();
    return;
  }

  // 3. 非公共路径必须登录
  if (!token) {
    isDynamicRoutesAdded = false;
    next("/login/index");
    return;
  }

  // 4. 验证token是否有效
  const isTokenValid = await validateToken(token);
  if (!isTokenValid) {
    Cookies.remove("ds-token");
    isDynamicRoutesAdded = false;
    next("/login/index");
    return;
  }

  // 6. 权限检查 - 检查用户是否有访问该路径的权限
  const requiredRole = getRequiredRole(to.path);
  if (requiredRole) {
    try {
      // 获取用户信息以检查角色
      const userStore = useUserStore();
      // 如果用户信息未加载，先获取用户信息
      if (!userStore.user.id) {
        await userStore.fetchUserInfo();
      }

      // 检查用户角色
      if (userStore.user.role !== requiredRole) {
        // 如果没有权限，重定向到首页
        next({ path: "/home" });
        return;
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
      next("/login/index");
      return;
    }
  }

  // 7. 确保动态路由已添加
  if (!isDynamicRoutesAdded) {
    try {
      routerConfig.forEach((route) => {
        router.addRoute("layout", route);
      });
      isDynamicRoutesAdded = true;

      // 重新导航以确保路由生效
      next({ ...to, replace: true });
      return;
    } catch (error) {
      console.error("添加动态路由失败:", error);
    }
  }

  // 所有检查通过，允许导航
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
