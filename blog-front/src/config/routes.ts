import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/home/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'posts/tech',
        name: 'tech-posts',
        component: () => import('@/pages/tech-list/index.vue'),
        meta: { title: '学习记录' },
      },
      {
        path: 'posts/review',
        name: 'review-posts',
        component: () => import('@/pages/review-list/index.vue'),
        meta: { title: '学习笔记' },
      },
      {
        path: 'post/:slug',
        name: 'post-detail',
        component: () => import('@/pages/post-detail/index.vue'),
        meta: { title: '文章详情' },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/pages/projects/index.vue'),
        meta: { title: '项目展示' },
      },
      {
        path: 'good-sites',
        name: 'good-sites',
        component: () => import('@/pages/good-sites/index.vue'),
        meta: { title: '好站' },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/pages/about/index.vue'),
        meta: { title: '关于我' },
      },
    ],
  },
];
