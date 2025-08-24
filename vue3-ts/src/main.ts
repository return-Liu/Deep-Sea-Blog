import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "normalize.css";
import "./assets/css/index.less";
import "@yike-design/ui/es/index.less";
import "element-plus/dist/index.css";
import "./assets/scss/theme.scss";
import VueLazyload from "vue-lazyload";
import Element from "element-plus";
import "./mock/mock";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "nprogress/nprogress.css";
import i18n from "./i18n/index";

const app = createApp(App);
const pinia = createPinia();

// 注册 Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app
  .use(Element)
  .use(router)
  .use(VueLazyload, {
    preLoad: 1.3,
    error: "dist/error.png",
    loading: "dist/loading.gif",
    attempt: 1,
  })
  .use(pinia)
  .use(i18n)
  .mount("#app");
