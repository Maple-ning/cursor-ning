import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/index.vue'),
  },
  {
    path: '/posts/tech',
    name: 'tech-posts',
    component: () => import('@/pages/tech-list/index.vue'),
  },
  {
    path: '/posts/review',
    name: 'review-posts',
    component: () => import('@/pages/review-list/index.vue'),
  },
  {
    path: '/post/:slug',
    name: 'post-detail',
    component: () => import('@/pages/post-detail/index.vue'),
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/pages/projects/index.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/about/index.vue'),
  },
]
