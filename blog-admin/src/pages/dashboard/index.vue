<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { postsByCategory, postsByStatus, projects, goodSites, about, init } = useBlogAdmin();
const techCount = computed(() => postsByCategory('tech').length);
const reviewCount = computed(() => postsByCategory('review').length);
const draftCount = computed(() => postsByStatus('draft').length);

onMounted(() => {
  init();
});
</script>

<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-900">枫叶小站内容维护</h2>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <a-card>
        <p class="text-sm text-gray-500">技术分享</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ techCount }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-gray-500">读后感</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ reviewCount }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-gray-500">项目展示</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ projects.length }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-gray-500">好站收藏</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ goodSites.length }}</p>
      </a-card>
      <a-card>
        <p class="text-sm text-gray-500">草稿文章</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ draftCount }}</p>
      </a-card>
    </div>
    <a-card title="关于我预览">
      <p class="text-lg font-semibold text-gray-900">{{ about.name }}</p>
      <p class="mt-2 text-gray-600">{{ about.intro }}</p>
    </a-card>
  </section>
</template>
