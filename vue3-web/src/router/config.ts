const routers = [
  {
    path: '/commonheader',
    name: 'commonheader',
    component: () => import('../components/common-header/CommonHeader.vue'),
  },
  {
    path: '/commonfooter',
    name: 'commonfooter',
    component: () => import('../components/common-footer/CommonFooter.vue'),
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/home/Home.vue'),
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('../views/article/Articles.vue'),
  },
  {
    path: '/photographys',
    name: 'photographys',
    component: () => import('../views/photographys/Photographys.vue'),
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../views/notes/Notes.vue'),
  },
  {
    path: '/abouts-deep-sea',
    name: 'abouts-deep-sea',
    component: () => import('../views/abouts/Abouts.vue'),
  },
  // 处理404
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/notfound/NotFound.vue'),
  },
]
export default routers
