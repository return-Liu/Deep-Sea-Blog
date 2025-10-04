// router/index.ts
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

// 管理员专用页面路径
const ADMIN_PATHS = ["/reportresultscenter", "/freezemanagement"];

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
      component: () => import("../views/userprotocol/UserProtocol.vue"),
    },
    {
      path: "/privacy",
      name: "Privacy",
      component: () => import("../views/privacy/Privacy.vue"),
    },
  ],
});

let isDynamicRoutesAdded = false;

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
    return false;
  }
}

// ... existing code ...
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
      next({ path: "/layout", replace: true });
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

  // 6. 如果是管理员路径，检查用户是否为管理员
  if (ADMIN_PATHS.includes(to.path)) {
    try {
      // 获取用户信息以检查角色
      const userStore = useUserStore();
      // 如果用户信息未加载，先获取用户信息
      if (!userStore.user.id) {
        await userStore.fetchUserInfo();
      }

      // 检查用户角色
      if (userStore.user.role !== "admin") {
        // 如果不是管理员，重定向到首页
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

// 后置钩子：结束进度条
router.afterEach(() => {
  NProgress.done();
});

export default router;
