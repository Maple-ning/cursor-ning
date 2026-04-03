<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { getProjects } from '@/services/projects';

const projects = ref<Awaited<ReturnType<typeof getProjects>>>([]);
const keyword = ref('');
const activeTech = ref<string | undefined>(undefined);

const getHost = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const normalizeComparableUrl = (url?: string) => {
  const value = String(url || '').trim();
  if (!value) return '';
  return value.replace(/\/+$/, '').toLowerCase();
};

const shouldShowSourceButton = (project: { url: string; sourceCodeUrl?: string }) => {
  const source = normalizeComparableUrl(project.sourceCodeUrl);
  if (!source) return false;
  const live = normalizeComparableUrl(project.url);
  return source !== live;
};

const allTechs = computed(() => {
  const set = new Set<string>();
  for (const project of projects.value) {
    for (const tech of project.techStack) set.add(tech);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
});

const filteredProjects = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  return projects.value.filter((project) => {
    const inKeyword = search.length === 0 || project.name.toLowerCase().includes(search);
    const inTech = !activeTech.value || project.techStack.includes(activeTech.value);
    return inKeyword && inTech;
  });
});

onMounted(async () => {
  projects.value = await getProjects();
});
</script>

<template>
  <section class="space-y-4">
    <div
      class="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-100/95 pb-2 pt-1 dark:border-slate-700/70 dark:bg-gray-950/95"
    >
      <div class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div class="grid gap-2 md:grid-cols-[1fr_220px_auto]">
          <a-input v-model:value="keyword" placeholder="搜索项目名称" allow-clear />
          <a-select v-model:value="activeTech" allow-clear placeholder="按技术栈筛选">
            <a-select-option v-for="tech in allTechs" :key="tech" :value="tech">
              {{ tech }}
            </a-select-option>
          </a-select>
          <a-button @click="keyword = ''; activeTech = undefined">重置</a-button>
        </div>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="project in filteredProjects"
        :key="project.name"
        class="project-card flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 class="text-lg font-bold leading-7 tracking-tight text-slate-900 dark:text-slate-100">
          {{ project.name }}
        </h2>
        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ project.description }}
        </p>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <a-tag v-for="tech in project.techStack" :key="tech" color="geekblue">
            {{ tech }}
          </a-tag>
        </div>

        <div class="mt-auto pt-4">
          <div class="mt-2 flex gap-2">
            <a :href="project.url" target="_blank" rel="noreferrer noopener" class="inline-block">
              <a-button size="small">体验项目</a-button>
            </a>
            <a
              v-if="shouldShowSourceButton(project)"
              :href="project.sourceCodeUrl"
              target="_blank"
              rel="noreferrer noopener"
              class="inline-block"
            >
              <a-button size="small">查看源码</a-button>
            </a>
          </div>
        </div>
      </article>
    </div>
    <a-empty v-if="filteredProjects.length === 0" description="暂无内容" />
  </section>
</template>

<style scoped>
.project-card {
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
}
</style>
