<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { Modal } from 'ant-design-vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import { appConfig } from '@/config';
import { routes } from '@/config/routes';
import AppHeader from '@/layouts/components/AppHeader.vue';
import { clearToken } from '@/utils/auth';

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);
const contentScrollRef = ref<HTMLElement | null>(null);

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

const isExternalHttpUrl = (href: string) => {
  try {
    const url = new URL(href, window.location.origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const onRootClickCapture = (event: MouseEvent) => {
  if (event.defaultPrevented) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || !isExternalHttpUrl(href)) return;

  event.preventDefault();
  event.stopPropagation();

  const resolved = new URL(href, window.location.origin).toString();
  const nextTarget = anchor.target || '_self';
  Modal.confirm({
    title: '即将跳转外部网站',
    content: resolved,
    okText: '继续访问',
    cancelText: '取消',
    onOk: () => {
      if (nextTarget === '_blank') {
        const opened = window.open(resolved, '_blank', 'noopener,noreferrer');
        if (opened) opened.opener = null;
        return;
      }
      window.location.assign(resolved);
    },
  });
};

watch(
  () => route.fullPath,
  async () => {
    mobileMenuOpen.value = false;
    document.title = `${currentPageTitle.value} - ${appConfig.appTitle}`;
    await nextTick();
    contentScrollRef.value?.scrollTo({ top: 0, behavior: 'auto' });
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-screen overflow-hidden bg-slate-100" @click.capture="onRootClickCapture">
    <AppHeader
      :nav-items="navItems"
      :active-nav-key="activeNavKey"
      :mobile-menu-open="mobileMenuOpen"
      @navigate="goTo"
      @toggle-mobile-menu="toggleMobileMenu"
      @update-mobile-menu="mobileMenuOpen = $event"
      @logout="logout"
    />
    <main ref="contentScrollRef" class="h-[calc(100vh-58px)] overflow-y-auto">
      <div class="mx-auto max-w-[92rem] px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition name="page-switch" mode="out-in">
            <component :is="Component" :key="currentRoute.fullPath" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-switch-enter-active,
.page-switch-leave-active {
  transition: opacity 0.26s ease;
}

.page-switch-enter-from,
.page-switch-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-switch-enter-active,
  .page-switch-leave-active {
    transition: opacity 0.01s linear;
  }
}
</style>
