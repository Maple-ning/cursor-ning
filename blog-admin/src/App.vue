<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

import { clearToken } from '@/utils/auth';

const navItems = [
  { to: '/', label: '概览' },
  { to: '/posts/tech', label: '技术分享管理' },
  { to: '/posts/review', label: '读后感管理' },
  { to: '/projects', label: '项目展示管理' },
  { to: '/about', label: '关于我管理' },
];

const route = useRoute();
const router = useRouter();
const isLoginPage = computed(() => route.path === '/login');

const logout = async () => {
  clearToken();
  await router.replace('/login');
};
</script>

<template>
  <RouterView v-if="isLoginPage" />

  <div v-else class="min-h-screen bg-gray-50">
    <header class="border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 class="text-lg font-semibold text-gray-900">Blog Admin</h1>
        <div class="flex items-center gap-2">
          <nav class="flex flex-wrap items-center gap-2">
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
          <a-button danger size="small" @click="logout">退出登录</a-button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">
      <RouterView />
    </main>
  </div>
</template>
