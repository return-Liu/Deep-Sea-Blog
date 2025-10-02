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

// 公共页面路径
const PUBLIC_PATHS = [
  "/login/index",
  "/resetpassword",
  "/userprotocol",
  "/privacy",
  "/frozencontainer",
];

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
      name: "login", // 使用更简洁的name
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
    {
      path: "/frozencontainer",
      name: "frozencontainer",
      component: () => import("../views/frozencontainer/FrozenContainer.vue"),
    },
  ],
});

// 修复：确保动态路由不会重复添加
let isDynamicRoutesAdded = false;

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const token = Cookies.get("ds-token");

  // 只在用户登录后且动态路由未添加时添加动态路由
  if (token && !isDynamicRoutesAdded && to.path !== "/login/index") {
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

  // 原有的路由守卫逻辑
  const isPublicPath = PUBLIC_PATHS.includes(to.path);
  const isLoginPath = to.path === "/login/index";
  const isFromResetPass = from.path === "/resetpassword";
  const isFrozenPath = to.path === "/frozencontainer";

  // 公共路径处理
  if (isPublicPath) {
    if (isFromResetPass && isLoginPath) {
      Cookies.remove("ds-token");
      isDynamicRoutesAdded = false; // 重置标志
      next();
      return;
    }

    if (token && isLoginPath) {
      next({ path: "/layout", replace: true });
      return;
    }

    next();
    return;
  }

  // 非公共路径必须登录
  if (!token) {
    isDynamicRoutesAdded = false; // 重置标志
    next("/login/index");
    return;
  }

  // 验证 token 是否有效
  const isTokenValid = await validateToken(token);
  if (!isTokenValid) {
    Cookies.remove("ds-token");
    isDynamicRoutesAdded = false; // 重置标志
    next("/login/index");
    return;
  }

  next();
});

// 验证 token 是否有效
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

// 后置钩子：结束进度条
router.afterEach(() => {
  NProgress.done();
});

export default router;
