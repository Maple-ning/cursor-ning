import { createRouter, createWebHistory } from 'vue-router';

import { routes } from '@/config/routes';
import { isLoggedIn } from '@/utils/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  if (to.meta.public) {
    if (to.path === '/login' && isLoggedIn()) return '/';
    return true;
  }
  if (!isLoggedIn()) return '/login';
  return true;
});

export default router;
