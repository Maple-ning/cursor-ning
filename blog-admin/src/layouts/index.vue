<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import { appConfig } from '@/config';
import { routes } from '@/config/routes';
import AppHeader from '@/layouts/components/AppHeader.vue';
import { clearToken } from '@/utils/auth';

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);

const navItems = computed(() =>
  routes
    .filter((item) => item.path === '/')
    .flatMap((item) => item.children ?? [])
    .map((item) => ({
      to: item.path?.startsWith('/') ? String(item.path) : `/${String(item.path)}`,
      label: (item.meta?.title as string) || String(item.name || item.path),
    }))
);

const isNavActive = (to: string) => {
  if (to === '/') return route.path === '/';
  return route.path === to || route.path.startsWith(`${to}/`);
};

const activeNavKey = computed(() => navItems.value.find((item) => isNavActive(item.to))?.to || '/');

const currentPageTitle = computed(() => {
  const metaTitle = route.meta?.title;
  if (typeof metaTitle === 'string' && metaTitle) return metaTitle;
  const matched = navItems.value.find((item) => isNavActive(item.to));
  return matched?.label || '页面';
});

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const goTo = async (to: string) => {
  if (isNavActive(to)) return;
  await router.push(to);
  mobileMenuOpen.value = false;
};

const logout = async () => {
  clearToken();
  await router.replace('/login');
};

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
    document.title = `${currentPageTitle.value} - ${appConfig.appTitle}`;
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader
      :nav-items="navItems"
      :active-nav-key="activeNavKey"
      :mobile-menu-open="mobileMenuOpen"
      @navigate="goTo"
      @toggle-mobile-menu="toggleMobileMenu"
      @update-mobile-menu="mobileMenuOpen = $event"
      @logout="logout"
    />
    <main class="mx-auto min-h-[calc(100vh-84px)] max-w-7xl px-6 py-8">
      <RouterView />
    </main>
  </div>
</template>
