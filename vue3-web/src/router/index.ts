import { createRouter, createWebHistory } from 'vue-router'
import routerConfig from './config'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('../views/main/Main.vue'),
    },
  ],
})
routerConfig.forEach((item) => {
  router.addRoute('main', item)
})
export default router
