import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from "vue-router";
import routerConfig from "./config";
import Cookies from "js-cookie";
import NProgress from "nprogress";

// 公共页面路径
const PUBLIC_PATHS = [
  "/login/index",
  "/resetpassword",
  "/userprotocol",
  "/privacy",
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
      name: "login/index",
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

// 异步添加动态路由
routerConfig.forEach((route) => {
  router.addRoute("layout", route);
});

// 前置守卫：登录校验 + 路由跳转控制
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    NProgress.start();

    const token = Cookies.get("ds-token");
    const isPublicPath = PUBLIC_PATHS.includes(to.path);
    const isLoginPath = to.path === "/login/index";
    const isFromResetPass = from.path === "/resetpassword";

    if (isPublicPath) {
      // 从修改密码页进入登录页，清除 token 并放行
      if (isFromResetPass && isLoginPath) {
        Cookies.remove("ds-token");
        next();
        return;
      }

      // 已登录访问登录页，重定向到首页
      if (token && isLoginPath) {
        next({ ...to, replace: true }); // 防止重复跳转
        return;
      }

      next();
      return;
    }

    // 非公开路径必须登录
    if (!token) {
      next("/login/index");
    } else {
      next();
    }
  }
);

// 后置钩子：结束进度条
router.afterEach(() => {
  NProgress.done();
});

export default router;
