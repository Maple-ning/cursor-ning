import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
  },
  {
    path: '/posts/tech',
    name: 'manage-tech-posts',
    component: () => import('@/pages/manage-tech-posts/index.vue'),
  },
  {
    path: '/posts/review',
    name: 'manage-review-posts',
    component: () => import('@/pages/manage-review-posts/index.vue'),
  },
  {
    path: '/projects',
    name: 'manage-projects',
    component: () => import('@/pages/manage-projects/index.vue'),
  },
  {
    path: '/about',
    name: 'manage-about',
    component: () => import('@/pages/manage-about/index.vue'),
  },
]
