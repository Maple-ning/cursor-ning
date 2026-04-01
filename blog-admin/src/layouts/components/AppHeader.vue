<script setup lang="ts">
interface NavItem {
  to: string;
  label: string;
}

defineProps<{
  navItems: NavItem[];
  activeNavKey: string;
  mobileMenuOpen: boolean;
}>();

defineEmits<{
  navigate: [to: string];
  toggleMobileMenu: [];
  updateMobileMenu: [open: boolean];
  logout: [];
}>();
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <h1 class="text-lg font-semibold text-gray-900">枫叶小站后台</h1>
      <div class="flex items-center gap-2">
        <a-button
          class="md:!hidden"
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
          class="hidden min-w-[520px] bg-transparent md:block"
          mode="horizontal"
          :selected-keys="[activeNavKey]"
          @click="$emit('navigate', String($event.key))"
        >
          <a-menu-item v-for="item in navItems" :key="item.to">
            {{ item.label }}
          </a-menu-item>
        </a-menu>
        <a-button size="small" @click="$emit('logout')">登出</a-button>
      </div>
    </div>
  </header>
  <a-drawer
    :open="mobileMenuOpen"
    placement="right"
    width="280"
    class="md:!hidden"
    title="导航"
    @update:open="$emit('updateMobileMenu', $event)"
  >
    <a-menu mode="inline" :selected-keys="[activeNavKey]" @click="$emit('navigate', String($event.key))">
      <a-menu-item v-for="item in navItems" :key="item.to">
        {{ item.label }}
      </a-menu-item>
    </a-menu>
  </a-drawer>
</template>

<style scoped>
:deep(.ant-menu-overflow) {
  border-bottom: 0 !important;
}

:deep(.ant-menu-horizontal > .ant-menu-item),
:deep(.ant-menu-horizontal > .ant-menu-submenu) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-bottom: 0 !important;
}

:deep(.ant-menu-horizontal > .ant-menu-item-selected) {
  background: rgba(59, 130, 246, 0.12) !important;
  border-radius: 6px;
}
</style>
