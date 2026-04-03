<script setup lang="ts">
import { RouterLink } from 'vue-router';
import moonIcon from '@/assets/icons/moon.svg';
import sunIcon from '@/assets/icons/sun.svg';

interface NavItem {
  name: string;
  label: string;
}

defineProps<{
  navItems: NavItem[];
  activeNavKeys: string[];
  mobileMenuOpen: boolean;
  isDark: boolean;
}>();

defineEmits<{
  navigate: [to: string];
  toggleMobileMenu: [];
  updateMobileMenu: [open: boolean];
  toggleTheme: [checked: string | number | boolean];
}>();
</script>

<template>
  <header
    class="app-top-header sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur transition-[background-color,border-color,color] duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900/90"
  >
    <div class="mx-auto max-w-6xl px-3 py-2 lg:px-6 lg:py-4">
      <div class="hidden items-center justify-between lg:flex">
        <RouterLink :to="{ name: 'home' }" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          枫叶小站
        </RouterLink>
        <a-button
          class="!hidden"
          type="text"
          :aria-expanded="mobileMenuOpen"
          aria-label="切换导航菜单"
          @click="$emit('toggleMobileMenu')"
        >
          <template #icon>
            <svg
              v-if="!mobileMenuOpen"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M4 7h16M4 12h16M4 17h16" stroke-width="2" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round" />
            </svg>
          </template>
        </a-button>
        <a-menu
          class="blog-nav-menu"
          mode="horizontal"
          theme="light"
          :selected-keys="activeNavKeys"
          @click="$emit('navigate', String($event.key))"
        >
          <a-menu-item v-for="item in navItems" :key="item.name">
            {{ item.label }}
          </a-menu-item>
        </a-menu>
        <a-switch
          class="theme-switch opacity-70 hover:opacity-100"
          :checked="isDark"
          @change="$emit('toggleTheme', $event)"
        >
          <template #checkedChildren>
            <img :src="moonIcon" alt="暗黑模式" class="switch-icon" />
          </template>
          <template #unCheckedChildren>
            <img :src="sunIcon" alt="亮色模式" class="switch-icon" />
          </template>
        </a-switch>
      </div>

      <div class="flex items-center justify-end lg:hidden">
        <a-button
          type="text"
          :aria-expanded="mobileMenuOpen"
          aria-label="切换导航菜单"
          @click="$emit('toggleMobileMenu')"
        >
          <template #icon>
            <svg
              v-if="!mobileMenuOpen"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M4 7h16M4 12h16M4 17h16" stroke-width="2" stroke-linecap="round" />
            </svg>
            <svg
              v-else
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round" />
            </svg>
          </template>
        </a-button>
      </div>
    </div>
  </header>
  <a-drawer
    :open="mobileMenuOpen"
    placement="right"
    width="260"
    class="lg:!hidden"
    title="菜单"
    @update:open="$emit('updateMobileMenu', $event)"
  >
    <div class="mb-3 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
      <span class="text-sm text-slate-600 dark:text-slate-300">暗黑模式</span>
      <a-switch :checked="isDark" @change="$emit('toggleTheme', $event)">
        <template #checkedChildren>
          <img :src="moonIcon" alt="暗黑模式" class="switch-icon" />
        </template>
        <template #unCheckedChildren>
          <img :src="sunIcon" alt="亮色模式" class="switch-icon" />
        </template>
      </a-switch>
    </div>
    <a-menu
      class="blog-nav-menu"
      mode="inline"
      theme="light"
      :selected-keys="activeNavKeys"
      @click="$emit('navigate', String($event.key))"
    >
      <a-menu-item v-for="item in navItems" :key="item.name">
        {{ item.label }}
      </a-menu-item>
    </a-menu>
  </a-drawer>
</template>

<style scoped>
.theme-switch :deep(.ant-switch-inner) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-switch :deep(.ant-switch-inner-unchecked) {
  margin-top: 0 !important;
}

/* 与顶栏灰底/文案色一致，不启用 ant-menu-dark（避免与 ConfigProvider + Tailwind 撞色） */
.blog-nav-menu:deep(.ant-menu) {
  background: transparent !important;
  border-bottom: 0 !important;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

.blog-nav-menu:deep(.ant-menu-overflow) {
  border-bottom: 0 !important;
}

.blog-nav-menu:deep(.ant-menu-horizontal > .ant-menu-item),
.blog-nav-menu:deep(.ant-menu-horizontal > .ant-menu-submenu) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-bottom: 0 !important;
}

.blog-nav-menu:deep(.ant-menu-item) {
  color: rgb(55 65 81) !important;
  transition:
    color 0.25s ease,
    background-color 0.25s ease;
}

.blog-nav-menu:deep(.ant-menu-item:hover),
.blog-nav-menu:deep(.ant-menu-item-active) {
  color: rgb(37 99 235) !important;
}

.blog-nav-menu:deep(.ant-menu-item-selected) {
  color: rgb(29 78 216) !important;
  background: rgba(59, 130, 246, 0.14) !important;
  border-radius: 6px;
}

:global(html.dark) .blog-nav-menu:deep(.ant-menu-item) {
  color: rgb(209 213 219) !important;
}

:global(html.dark) .blog-nav-menu:deep(.ant-menu-item:hover),
:global(html.dark) .blog-nav-menu:deep(.ant-menu-item-active) {
  color: rgb(96 165 250) !important;
}

:global(html.dark) .blog-nav-menu:deep(.ant-menu-item-selected) {
  color: rgb(191 219 254) !important;
  background: rgba(59, 130, 246, 0.22) !important;
}

/* 抽屉内纵向菜单：背景随 Drawer，文字仍与顶栏同级对比度 */
:global(html.dark) .ant-drawer .blog-nav-menu:deep(.ant-menu) {
  background: transparent !important;
}

.switch-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  display: block;
}
</style>
