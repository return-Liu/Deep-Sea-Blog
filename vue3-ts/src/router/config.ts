const routers = [
  {
    path: "/commonaside",
    name: "commonaside",
    component: () => import("../components/common-aside/CommonAside.vue"),
  },
  {
    path: "/commonheader",
    name: "commonheader",
    component: () => import("../components/common-header/CommonHeader.vue"),
  },
  {
    path: "/commonfooter",
    name: "commonfooter",
    component: () => import("../components/common-footer/CommonFooter.vue"),
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home/Home.vue"),
  },
  {
    path: "/share/:tab?",
    name: "share",
    component: () => import("../views/share/Share.vue"),
    props: true,
  },
  {
    path: "/download",
    name: "download",
    component: () => import("../views/download/DownLoad.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/search/Search.vue"),
  },
  {
    path: "/setting/:tab?",
    name: "setting",
    component: () => import("../views/setting/Setting.vue"),
  },
  {
    path: "/suggestionsfeedback",
    name: "suggestionsfeedback",
    component: () =>
      import("../views/suggestionsfeedback/SuggestionsFeedback.vue"),
  },
  {
    path: "/reportresultscenter",
    name: "reportresultscenter",
    component: () =>
      import("../views/reportresultscenter/ReportResultsCenter.vue"),
  },
  {
    path: "/localresources",
    name: "localresources",
    component: () => import("../views/localresources/LocalResources.vue"),
  },
  {
    path: "/messagewall/:tab?",
    name: "messagewall",
    component: () => import("../views/messagewall/MessageWall.vue"),
    props: (route: any) => ({
      tab: route.params.tab,
      category: route.query.id || "全部",
    }),
  },
  {
    path: "/photowall/:tab?",
    name: "photowall",
    component: () => import("../views/photowall/PhotoWall.vue"),
    props: (route: any) => ({
      tab: route.params.tab,
      category: route.query.id || "自然风光",
    }),
  },
  // 处理404问题
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/notfound/NotFound.vue"),
  },
  {
    path: "/comment/chat/:messageId",
    name: "comment/chat",
    component: () => import("../views/comment/Comment.vue"),
  },
  {
    path: "/users/:uuid",
    name: "users",
    component: () => import("../views/users/Users.vue"),
  },
  {
    path: "/securitycenter",
    name: "securitycenter",
    component: () => import("../views/securitycenter/SecurityCenter.vue"),
  },
  {
    path: "/overview/:id?",
    name: "overview",
    component: () => import("../views/overview/OverView.vue"),
  },
  {
    path: "/devicemanagement/:uuid",
    name: "devicemanagement",
    component: () => import("../views/devicemanagement/DeviceManagement.vue"),
  },
  {
    path: "viewsystememail/:id",
    name: "viewsystememail",
    component: () => import("../views/viewsystememail/Viewsystememail.vue"),
  },
];
export default routers;
