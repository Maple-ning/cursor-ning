<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getProjects } from '@/services/projects';

const projects = ref<Awaited<ReturnType<typeof getProjects>>>([]);

onMounted(async () => {
  projects.value = await getProjects();
});
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">项目展示</h1>
    <p class="text-gray-600 dark:text-gray-300">这里展示我做过的一些项目，点击可跳转到项目地址。</p>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <a-card v-for="project in projects" :key="project.name" class="blog-card-lift h-full">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ project.name }}</h2>
        <p class="mt-2 text-gray-700 dark:text-gray-300">{{ project.description }}</p>

        <div class="mt-3 flex flex-wrap gap-2">
          <a-tag v-for="tech in project.techStack" :key="tech" color="geekblue">
            {{ tech }}
          </a-tag>
        </div>

        <a :href="project.url" target="_blank" rel="noreferrer noopener" class="mt-4 inline-block">
          <a-button type="primary">查看项目</a-button>
        </a>
      </a-card>
    </div>
    <a-empty v-if="projects.length === 0" description="暂无内容" />
  </section>
</template>
