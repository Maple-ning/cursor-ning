<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/posts/tech', label: '技术分享' },
  { to: '/posts/review', label: '读后感' },
  { to: '/projects', label: '项目展示' },
  { to: '/about', label: '关于我' },
]

type ThemeMode = 'light' | 'dark'
const themeMode = ref<ThemeMode>('light')
const isDark = computed(() => themeMode.value === 'dark')

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

const toggleTheme = (checked: string | number | boolean) => {
  themeMode.value = checked ? 'dark' : 'light'
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme-mode')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    themeMode.value = savedTheme
  } else {
    themeMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  applyTheme(themeMode.value)
})

watch(themeMode, (mode) => {
  localStorage.setItem('theme-mode', mode)
  applyTheme(mode)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
    <header class="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur transition-colors dark:border-gray-800 dark:bg-gray-900/80">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <RouterLink to="/" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Ning Blog
        </RouterLink>
        <div class="flex items-center gap-3">
          <a-switch :checked="isDark" checked-children="暗" un-checked-children="亮" @change="toggleTheme" />
          <nav class="flex flex-wrap items-center gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {{ item.label }}
          </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <RouterView />
    </main>
  </div>
</template>
