<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ConfigProvider, theme as antdTheme } from 'ant-design-vue';
import type { RouteRecordName } from 'vue-router';
import { RouterView, useRoute, useRouter } from 'vue-router';

import { appConfig } from '@/config';
import { routes } from '@/config/routes';
import AppHeader from '@/layouts/components/AppHeader.vue';

type ThemeMode = 'light' | 'dark';

type NavItem = { name: string; label: string };

const route = useRoute();
const router = useRouter();
const themeMode = ref<ThemeMode>('light');
const mobileMenuOpen = ref(false);

const isDark = computed(() => themeMode.value === 'dark');

const antTheme = computed(() => ({
  algorithm: isDark.value ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
}));
const navItems = computed(() =>
  routes
    .filter((item) => item.path === '/')
    .flatMap((item) => item.children ?? [])
    .filter((item) => typeof item.path === 'string' && !item.path.includes(':') && item.name)
    .map(
      (item): NavItem => ({
        name: String(item.name),
        label: (item.meta?.title as string) || String(item.name),
      }),
    ),
);

const isNavActiveByName = (name: string) => route.name === name;

/** 与 route.path 一致（不含应用 base），文章详情等不在顶栏菜单里的路由不要误高亮首页 */
const activeNavKeys = computed((): string[] => {
  const path = route.path;
  if (path.startsWith('/post/')) {
    return [];
  }

  const current = route.name as string | undefined;
  const found = navItems.value.find((item) => item.name === current);
  if (found) {
    return [found.name];
  }

  if (path === '/' || path === '') {
    return ['home'];
  }
  if (path.startsWith('/posts/tech')) {
    return ['tech-posts'];
  }
  if (path.startsWith('/posts/review')) {
    return ['review-posts'];
  }
  if (path.startsWith('/projects')) {
    return ['projects'];
  }
  if (path.startsWith('/good-sites')) {
    return ['good-sites'];
  }
  if (path.startsWith('/about')) {
    return ['about'];
  }

  return [];
});

const currentPageTitle = computed(() => {
  const metaTitle = route.meta?.title;
  if (typeof metaTitle === 'string' && metaTitle) return metaTitle;
  const current = route.name as string | undefined;
  const matched = navItems.value.find((item) => item.name === current);
  return matched?.label || '页面';
});

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark');
};

const toggleTheme = (checked: string | number | boolean) => {
  themeMode.value = checked ? 'dark' : 'light';
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const goTo = async (name: string) => {
  if (isNavActiveByName(name)) return;
  await router.push({ name: name as RouteRecordName });
  mobileMenuOpen.value = false;
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme-mode');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    themeMode.value = savedTheme;
  } else {
    themeMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(themeMode.value);
});

watch(themeMode, (mode) => {
  localStorage.setItem('theme-mode', mode);
  applyTheme(mode);
});

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
  <div
    class="min-h-screen bg-slate-100 transition-[background-color] duration-300 ease-in-out dark:bg-gray-950"
  >
    <ConfigProvider :theme="antTheme">
      <AppHeader
        :nav-items="navItems"
        :active-nav-keys="activeNavKeys"
        :mobile-menu-open="mobileMenuOpen"
        :is-dark="isDark"
        @navigate="goTo"
        @toggle-mobile-menu="toggleMobileMenu"
        @update-mobile-menu="mobileMenuOpen = $event"
        @toggle-theme="toggleTheme"
      />
      <main class="mx-auto min-h-[calc(100vh-84px)] max-w-6xl px-6 py-8">
        <RouterView />
      </main>
    </ConfigProvider>
  </div>
</template>
