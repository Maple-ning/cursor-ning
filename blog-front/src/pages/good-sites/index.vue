<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { getGoodSites, type GoodSiteItem } from '@/services/goodSites';

/** 下拉「全部」项的值，与具体分类名区分 */
const ALL_CATEGORIES = '__all__';

const sites = ref<GoodSiteItem[]>([]);
const categoryOrder = ref<string[]>([]);
const activeCategory = ref<string>(ALL_CATEGORIES);
const selectedCategoryFilter = ref<string | undefined>(ALL_CATEGORIES);
const mobileDirectoryOpen = ref(false);
const contentRef = ref<HTMLElement | null>(null);
const sectionRefs = ref<Record<string, HTMLElement>>({});
const headingRefs = ref<Record<string, HTMLElement>>({});
const headerOffsetPx = 76;
const pageScrollContainerRef = ref<HTMLElement | null>(null);

const categoryLabel = (site: GoodSiteItem) => site.category || '未分类';

const filteredSites = computed(() => {
  const current = selectedCategoryFilter.value || ALL_CATEGORIES;
  if (current === ALL_CATEGORIES) return sites.value;
  return sites.value.filter((site) => categoryLabel(site) === current);
});

const sortCategoriesByOrder = (input: Iterable<string>) => {
  const set = new Set<string>();
  for (const c of input) {
    if (c) set.add(c);
  }

  const ordered = categoryOrder.value.filter((c) => set.has(c));
  const missing = [...set].filter((c) => !ordered.includes(c));
  missing.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return [...ordered, ...missing];
};

const allCategories = computed(() => {
  const set = new Set<string>();
  for (const site of sites.value) {
    set.add(categoryLabel(site));
  }
  return sortCategoriesByOrder(set);
});

const grouped = computed(() => {
  const map = new Map<string, GoodSiteItem[]>();
  for (const site of filteredSites.value) {
    const key = categoryLabel(site);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(site);
  }

  const categoriesInFiltered = new Set<string>();
  for (const site of filteredSites.value) {
    categoriesInFiltered.add(categoryLabel(site));
  }
  const orderedCategories = sortCategoriesByOrder(categoriesInFiltered);

  return orderedCategories.map((category) => [category, map.get(category) || []] as [string, GoodSiteItem[]]);
});

const sidebarCategories = computed(() => {
  const current = selectedCategoryFilter.value || ALL_CATEGORIES;
  if (current === ALL_CATEGORIES) return allCategories.value;
  return allCategories.value.filter((c) => c === current);
});

const categoryCount = computed(() => {
  const map = new Map<string, number>();
  for (const site of sites.value) {
    const key = categoryLabel(site);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
});

const contentViewKey = computed(() => selectedCategoryFilter.value || ALL_CATEGORIES);

const setSectionRef = (category: string, el: unknown) => {
  if (!(el instanceof HTMLElement)) {
    delete sectionRefs.value[category];
    return;
  }
  sectionRefs.value[category] = el;
};

const setHeadingRef = (category: string, el: unknown) => {
  if (!(el instanceof HTMLElement)) {
    delete headingRefs.value[category];
    return;
  }
  headingRefs.value[category] = el;
};

const getSelectPopupContainer = (node?: HTMLElement) => {
  if (node?.parentElement) return node.parentElement;
  if (typeof window !== 'undefined' && window.document?.body) return window.document.body;
  return node ?? null;
};

const filterCategoryOption = (input: string, option?: { children?: unknown }) =>
  String(option?.children ?? '')
    .toLowerCase()
    .includes(input.toLowerCase());

const onCategoryFilterChange = (value: string | undefined) => {
  selectedCategoryFilter.value = value || ALL_CATEGORIES;
};

const closeMobileDirectory = () => {
  mobileDirectoryOpen.value = false;
};

const resolvePageScrollContainer = () =>
  document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');

const usesInnerScrollContainer = () => {
  const container = contentRef.value;
  if (!container) return false;
  const style = getComputedStyle(container);
  const canScrollY = style.overflowY === 'auto' || style.overflowY === 'scroll';
  return canScrollY && container.scrollHeight > container.clientHeight + 2;
};

const scrollToCategory = (category: string) => {
  activeCategory.value = category;
  const container = contentRef.value;

  if (category === ALL_CATEGORIES) {
    if (usesInnerScrollContainer() && container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    closeMobileDirectory();
    return;
  }

  const heading = headingRefs.value[category];
  if (!heading) return;

  if (usesInnerScrollContainer() && container) {
    const containerRect = container.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const paddingTop = Number.parseFloat(getComputedStyle(container).paddingTop || '0') || 0;
    const targetTop = container.scrollTop + (headingRect.top - containerRect.top) - paddingTop;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    closeMobileDirectory();
    return;
  }

  const pageContainer = pageScrollContainerRef.value ?? resolvePageScrollContainer();
  if (pageContainer) {
    const cRect = pageContainer.getBoundingClientRect();
    const hRect = heading.getBoundingClientRect();
    const targetTop = pageContainer.scrollTop + (hRect.top - cRect.top) - headerOffsetPx;
    pageContainer.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  } else {
    const top = window.scrollY + heading.getBoundingClientRect().top - headerOffsetPx;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
  closeMobileDirectory();
};

const syncActiveCategoryByScroll = () => {
  const names = sidebarCategories.value;
  if (names.length === 0) {
    activeCategory.value = ALL_CATEGORIES;
    return;
  }

  if (usesInnerScrollContainer()) {
    const container = contentRef.value;
    if (!container) return;

    // 回到顶部时突出“第一个分类”
    if (container.scrollTop <= 2) {
      activeCategory.value = names[0] ?? ALL_CATEGORIES;
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const paddingTop = Number.parseFloat(getComputedStyle(container).paddingTop || '0') || 0;
    const thresholdTop = containerTop + paddingTop + 2;

    let current = names[0] ?? ALL_CATEGORIES;
    for (const name of names) {
      const heading = headingRefs.value[name];
      if (!heading) continue;
      if (heading.getBoundingClientRect().top <= thresholdTop) {
        current = name;
      } else {
        break;
      }
    }

    if (activeCategory.value !== current) {
      activeCategory.value = current;
    }
    return;
  }

  // 移动端：使用外层主滚动容器（或 window 兜底）同步目录高亮
  const pageContainer = pageScrollContainerRef.value ?? resolvePageScrollContainer();
  const pageScrollTop = pageContainer ? pageContainer.scrollTop : window.scrollY;
  if (pageScrollTop <= 2) {
    activeCategory.value = names[0] ?? ALL_CATEGORIES;
    return;
  }

  const thresholdTop = pageContainer
    ? pageContainer.getBoundingClientRect().top + headerOffsetPx + 6
    : headerOffsetPx + 6;
  let current = names[0] ?? ALL_CATEGORIES;
  for (const name of names) {
    const heading = headingRefs.value[name];
    if (!heading) continue;
    if (heading.getBoundingClientRect().top <= thresholdTop) {
      current = name;
    } else {
      break;
    }
  }
  if (activeCategory.value !== current) {
    activeCategory.value = current;
  }
};

watch(grouped, (nextGroups) => {
  const names = nextGroups.map(([name]) => name);
  if (activeCategory.value !== ALL_CATEGORIES && !names.includes(activeCategory.value)) {
    activeCategory.value = ALL_CATEGORIES;
  }
  void nextTick(syncActiveCategoryByScroll);
});

watch(allCategories, (next) => {
  if (
    selectedCategoryFilter.value &&
    selectedCategoryFilter.value !== ALL_CATEGORIES &&
    !next.includes(selectedCategoryFilter.value)
  ) {
    selectedCategoryFilter.value = ALL_CATEGORIES;
  }
});

watch(selectedCategoryFilter, () => {
  const container = contentRef.value;
  if (usesInnerScrollContainer() && container) {
    container.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    const pageContainer = pageScrollContainerRef.value ?? resolvePageScrollContainer();
    if (pageContainer) {
      pageContainer.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
  if (!selectedCategoryFilter.value || selectedCategoryFilter.value === ALL_CATEGORIES) {
    selectedCategoryFilter.value = ALL_CATEGORIES;
    activeCategory.value = ALL_CATEGORIES;
    return;
  }
  activeCategory.value = selectedCategoryFilter.value;
  if (mobileDirectoryOpen.value) closeMobileDirectory();
});

onMounted(async () => {
  const data = await getGoodSites();
  sites.value = data.items;
  categoryOrder.value = data.categoryOrder;
  await nextTick();
  pageScrollContainerRef.value = resolvePageScrollContainer();
  syncActiveCategoryByScroll();
  pageScrollContainerRef.value?.addEventListener('scroll', syncActiveCategoryByScroll, {
    passive: true,
  });
  window.addEventListener('scroll', syncActiveCategoryByScroll, { passive: true });
  window.addEventListener('resize', syncActiveCategoryByScroll, { passive: true });
});

onBeforeUnmount(() => {
  pageScrollContainerRef.value?.removeEventListener('scroll', syncActiveCategoryByScroll);
  window.removeEventListener('scroll', syncActiveCategoryByScroll);
  window.removeEventListener('resize', syncActiveCategoryByScroll);
});
</script>

<template>
  <section class="good-sites-page lg:h-[calc(100dvh-148px)] lg:overflow-hidden">
    <button
      type="button"
      class="gs-mobile-directory-toggle lg:hidden"
      :aria-expanded="mobileDirectoryOpen"
      aria-label="展开分类目录"
      @click="mobileDirectoryOpen = !mobileDirectoryOpen"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h10" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <Transition name="gs-mobile-panel">
      <div v-if="mobileDirectoryOpen" class="gs-mobile-backdrop lg:hidden" @click="closeMobileDirectory">
        <aside class="gs-mobile-panel" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">分类目录</p>
            <button type="button" class="text-slate-500 hover:text-slate-700 dark:text-slate-300" @click="closeMobileDirectory">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="space-y-3 px-4 py-3">
            <a-select
              v-model:value="selectedCategoryFilter"
              show-search
              allow-clear
              option-filter-prop="children"
              class="gs-search-select w-full"
              :get-popup-container="getSelectPopupContainer"
              :filter-option="filterCategoryOption"
              aria-label="分类筛选"
              @change="onCategoryFilterChange"
              @clear="selectedCategoryFilter = ALL_CATEGORIES"
            >
              <a-select-option :value="ALL_CATEGORIES">全部分类</a-select-option>
              <a-select-option v-for="c in allCategories" :key="c" :value="c">
                {{ c }}
              </a-select-option>
            </a-select>

            <div class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              <button
                v-for="c in sidebarCategories"
                :key="`mobile-${c}`"
                type="button"
                class="gs-category-btn flex min-w-0 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition"
                :class="
                  activeCategory === c
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/12 dark:text-blue-300 dark:ring-blue-500/35'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50'
                "
                @click="scrollToCategory(c)"
              >
                <span class="truncate pr-2">{{ c }}</span>
                <span class="text-xs">{{ categoryCount.get(c) || 0 }}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Transition>

    <div class="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:h-full">
        <aside
          class="gs-sidebar hidden space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60 lg:flex lg:flex-col lg:overflow-y-auto"
        >
          <div class="space-y-2">
            <a-select
              v-model:value="selectedCategoryFilter"
              show-search
              allow-clear
              option-filter-prop="children"
              class="gs-search-select w-full"
              :get-popup-container="getSelectPopupContainer"
              :filter-option="filterCategoryOption"
              aria-label="分类筛选"
              @change="onCategoryFilterChange"
              @clear="selectedCategoryFilter = ALL_CATEGORIES"
            >
              <a-select-option :value="ALL_CATEGORIES">全部分类</a-select-option>
              <a-select-option v-for="c in allCategories" :key="c" :value="c">
                {{ c }}
              </a-select-option>
            </a-select>
          </div>

          <div class="space-y-2">
            <button
              v-for="c in sidebarCategories"
              :key="c"
              type="button"
              class="gs-category-btn flex min-w-0 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition"
              :class="
                activeCategory === c
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/12 dark:text-blue-300 dark:ring-blue-500/35'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50'
              "
              @click="scrollToCategory(c)"
            >
              <span class="truncate pr-2">{{ c }}</span>
              <span class="text-xs">{{ categoryCount.get(c) || 0 }}</span>
            </button>
          </div>
        </aside>

        <div
          ref="contentRef"
          class="gs-content pr-1 sm:pr-2 lg:h-full lg:overflow-y-auto"
          @scroll.passive="syncActiveCategoryByScroll"
        >
          <Transition name="gs-content-fade" mode="out-in">
            <div :key="contentViewKey" class="gs-content-inner">
              <template v-if="grouped.length > 0">
            <div class="space-y-10">
                  <div
                    v-for="[category, list] in grouped"
                    :key="category"
                    :ref="(el) => setSectionRef(category, el)"
                    class="gs-category-block space-y-3"
                  >
                    <h2
                      :ref="(el) => setHeadingRef(category, el)"
                      class="gs-section-title text-base font-semibold text-gray-800 dark:text-gray-200"
                    >
                      {{ category }}
                    </h2>
                <div class="gs-card-grid">
                      <a
                        v-for="site in list"
                        :key="site.id"
                        :href="site.url"
                        target="_blank"
                        rel="noreferrer noopener"
                    class="gs-site-card good-site-card block rounded-xl border border-gray-200 bg-white p-6 shadow-sm outline-none transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900"
                      >
                        <p class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ site.title }}</p>
                        <p
                          v-if="site.description"
                          class="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                        >
                          {{ site.description }}
                        </p>
                        <p class="mt-3 truncate text-xs text-blue-600 dark:text-blue-400">{{ site.url }}</p>
                      </a>
                    </div>
                  </div>
                </div>
              </template>

              <a-empty
                v-else
                :description="sites.length > 0 ? '该分类或关键字下暂无站点' : '暂无内容'"
              />
            </div>
          </Transition>
        </div>
    </div>
  </section>
</template>

<style scoped>
.good-sites-page {
  background: transparent;
}

.gs-mobile-directory-toggle {
  position: fixed;
  right: 16px;
  bottom: 20px;
  z-index: 45;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgb(191 219 254);
  background: rgb(37 99 235);
  color: #fff;
  box-shadow:
    0 8px 22px -10px rgb(37 99 235 / 0.7),
    0 1px 2px rgb(0 0 0 / 0.22);
}

.gs-mobile-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgb(2 6 23 / 0.42);
  display: flex;
  justify-content: flex-end;
}

.gs-mobile-panel {
  width: min(86vw, 320px);
  height: 100%;
  background: #fff;
  border-left: 1px solid rgb(226 232 240);
  box-shadow: -14px 0 34px -20px rgb(15 23 42 / 0.35);
}

.gs-mobile-panel-enter-active,
.gs-mobile-panel-leave-active {
  transition: opacity 0.2s ease;
}

.gs-mobile-panel-enter-active .gs-mobile-panel,
.gs-mobile-panel-leave-active .gs-mobile-panel {
  transition: transform 0.2s ease;
}

.gs-mobile-panel-enter-from,
.gs-mobile-panel-leave-to {
  opacity: 0;
}

.gs-mobile-panel-enter-from .gs-mobile-panel,
.gs-mobile-panel-leave-to .gs-mobile-panel {
  transform: translateX(18px);
}

.gs-sidebar {
  backdrop-filter: blur(8px);
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 8px 24px -18px rgb(15 23 42 / 0.22);
}

.gs-search {
  font-size: 14px;
  border-radius: 10px;
  border-color: rgb(203 213 225);
  box-shadow: inset 0 1px 1px rgb(15 23 42 / 0.03);
}

.gs-search:focus {
  border-color: rgb(59 130 246);
  box-shadow:
    0 0 0 3px rgb(59 130 246 / 0.14),
    inset 0 1px 1px rgb(15 23 42 / 0.03);
}

.gs-search-select :deep(.ant-select-selector) {
  min-height: 38px !important;
  border-radius: 10px !important;
  border-color: rgb(203 213 225) !important;
  padding-inline: 10px !important;
  box-shadow: inset 0 1px 1px rgb(15 23 42 / 0.03);
}

.gs-search-select :deep(.ant-select-selection-search-input),
.gs-search-select :deep(.ant-select-selection-item),
.gs-search-select :deep(.ant-select-selection-placeholder) {
  font-size: 14px !important;
  line-height: 36px !important;
}

.gs-category-btn {
  font-size: 14px;
  font-weight: 500;
  border: 1px solid transparent;
  color: rgb(75 85 99);
}

.gs-category-btn:hover {
  border-color: rgb(203 213 225);
  background: rgb(148 163 184 / 0.08);
}

.gs-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0.01em;
  color: rgb(30 41 59);
}

.gs-section-title::before {
  content: '';
  width: 3px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgb(37 99 235), rgb(14 165 233));
}

.gs-site-card {
  border-color: rgb(226 232 240);
  display: flex;
  min-height: 148px;
  flex-direction: column;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.06),
    0 12px 28px -20px rgb(15 23 42 / 0.18);
}

.gs-site-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 2px 6px rgb(15 23 42 / 0.08),
    0 16px 30px -22px rgb(15 23 42 / 0.24);
}

.gs-category-block + .gs-category-block {
  border-top: 1px solid rgb(203 213 225);
  padding-top: 20px;
}

.gs-card-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 860px) {
  .gs-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .gs-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gs-content-inner {
  min-height: 100%;
}

.gs-content-fade-enter-active,
.gs-content-fade-leave-active {
  transition: opacity 0.2s ease;
}

.gs-content-fade-enter-from,
.gs-content-fade-leave-to {
  opacity: 0;
}

.gs-sidebar::-webkit-scrollbar,
.gs-content::-webkit-scrollbar {
  width: 8px;
}

.gs-sidebar::-webkit-scrollbar-thumb,
.gs-content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgb(148 163 184 / 0.55);
}

.gs-sidebar::-webkit-scrollbar-thumb:hover,
.gs-content::-webkit-scrollbar-thumb:hover {
  background: rgb(100 116 139 / 0.72);
}

.dark .gs-search {
  border-color: rgb(71 85 105);
  box-shadow: inset 0 1px 1px rgb(0 0 0 / 0.25);
}

.dark .gs-search:focus {
  border-color: rgb(96 165 250);
  box-shadow:
    0 0 0 3px rgb(96 165 250 / 0.2),
    inset 0 1px 1px rgb(0 0 0 / 0.25);
}

.dark .gs-search-select :deep(.ant-select-selector) {
  border-color: rgb(71 85 105) !important;
  background: rgb(17 24 39) !important;
}

.dark .gs-mobile-panel {
  background: rgb(2 6 23);
  border-left-color: rgb(51 65 85);
}

.dark .gs-category-btn:hover {
  border-color: rgb(71 85 105);
  background: rgb(148 163 184 / 0.1);
}

.dark .gs-section-title {
  color: rgb(226 232 240);
}

.dark .gs-site-card {
  border-color: rgb(51 65 85);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.35),
    0 12px 26px -18px rgb(0 0 0 / 0.52);
}

.dark .gs-category-block + .gs-category-block {
  border-top-color: rgb(71 85 105 / 0.8);
}

.dark .gs-site-card:hover {
  box-shadow:
    0 2px 8px rgb(0 0 0 / 0.42),
    0 18px 34px -20px rgb(0 0 0 / 0.58);
}

.dark .gs-sidebar::-webkit-scrollbar-thumb,
.dark .gs-content::-webkit-scrollbar-thumb {
  background: rgb(71 85 105 / 0.8);
}
</style>
