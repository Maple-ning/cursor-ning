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
  <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-3 sm:px-6 md:px-8">
      <div class="min-w-0">
        <p class="truncate text-base font-semibold text-slate-900">枫叶小站后台</p>
      </div>

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
          class="admin-top-nav hidden min-w-[560px] bg-transparent md:block"
          mode="horizontal"
          :selected-keys="[activeNavKey]"
          @click="$emit('navigate', String($event.key))"
        >
          <a-menu-item v-for="item in navItems" :key="item.to">
            {{ item.label }}
          </a-menu-item>
        </a-menu>

        <a-tooltip title="退出登录">
          <a-button size="small" type="text" aria-label="退出登录" @click="$emit('logout')">
            <template #icon>
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-width="2" stroke-linecap="round" />
                <path d="M10 17l5-5-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 12H3" stroke-width="2" stroke-linecap="round" />
              </svg>
            </template>
          </a-button>
        </a-tooltip>
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
    <div class="space-y-2">
      <button
        v-for="item in navItems"
        :key="item.to"
        type="button"
        class="w-full rounded-lg px-3 py-2.5 text-left text-sm transition"
        :class="
          activeNavKey === item.to
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        "
        @click="$emit('navigate', item.to)"
      >
        {{ item.label }}
      </button>
    </div>
    <a-button class="mt-4" block @click="$emit('logout')">
      <template #icon>
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke-width="2" stroke-linecap="round" />
          <path d="M10 17l5-5-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M15 12H3" stroke-width="2" stroke-linecap="round" />
        </svg>
      </template>
      退出登录
    </a-button>
  </a-drawer>
</template>

<style scoped>
.admin-top-nav:deep(.ant-menu-overflow) {
  border-bottom: 0 !important;
}

.admin-top-nav:deep(.ant-menu-horizontal > .ant-menu-item),
.admin-top-nav:deep(.ant-menu-horizontal > .ant-menu-submenu) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-bottom: 0 !important;
}

.admin-top-nav:deep(.ant-menu-horizontal > .ant-menu-item-selected) {
  border-radius: 8px;
  background: rgb(239 246 255) !important;
}
</style>
