<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { getGoodSites, type GoodSiteItem } from '@/services/goodSites';

/** 下拉「全部」项的值，与具体分类名区分 */
const ALL_CATEGORIES = '__all__';

const sites = ref<GoodSiteItem[]>([]);
const activeCategory = ref<string>(ALL_CATEGORIES);

const categoryLabel = (site: GoodSiteItem) => site.category || '未分类';

const categories = computed(() => {
  const set = new Set<string>();
  for (const site of sites.value) {
    set.add(categoryLabel(site));
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
});

const filteredSites = computed(() => {
  if (activeCategory.value === ALL_CATEGORIES) return sites.value;
  return sites.value.filter((s) => categoryLabel(s) === activeCategory.value);
});

const grouped = computed(() => {
  const map = new Map<string, GoodSiteItem[]>();
  for (const site of filteredSites.value) {
    const key = categoryLabel(site);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(site);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'zh-CN'));
});

onMounted(async () => {
  sites.value = await getGoodSites();
});
</script>

<template>
  <section class="space-y-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">好站收藏</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">按分类整理的个人书签，悬停卡片会有小动效。</p>
      </div>
      <a-select
        v-model:value="activeCategory"
        class="w-full min-w-44 sm:w-52"
        :disabled="sites.length === 0"
        aria-label="按分类筛选"
      >
        <a-select-option :value="ALL_CATEGORIES">全部</a-select-option>
        <a-select-option v-for="c in categories" :key="c" :value="c">
          {{ c }}
        </a-select-option>
      </a-select>
    </div>

    <template v-if="grouped.length > 0">
      <div v-for="[category, list] in grouped" :key="category" class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ category }}</h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            v-for="site in list"
            :key="site.id"
            :href="site.url"
            target="_blank"
            rel="noreferrer noopener"
            class="good-site-card block rounded-xl border border-gray-200 bg-white p-4 shadow-sm outline-none transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900"
          >
            <p class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ site.title }}</p>
            <p v-if="site.description" class="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
              {{ site.description }}
            </p>
            <p class="mt-3 truncate text-xs text-blue-600 dark:text-blue-400">{{ site.url }}</p>
          </a>
        </div>
      </div>
    </template>

    <a-empty
      v-else
      :description="sites.length > 0 ? '该分类下暂无站点' : '暂无内容'"
    />
  </section>
</template>
