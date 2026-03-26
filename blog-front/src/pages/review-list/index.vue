<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { getPostsByCategory } from '@/services/posts';

const keyword = ref('');
const activeTag = ref<string | undefined>(undefined);
const reviewPosts = ref<Awaited<ReturnType<typeof getPostsByCategory>>>([]);

const allTags = computed(() => {
  const tags = new Set<string>();
  for (const post of reviewPosts.value) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags];
});

const filteredPosts = computed(() => {
  const search = keyword.value.trim().toLowerCase();
  return reviewPosts.value.filter((post) => {
    const inKeyword =
      search.length === 0 ||
      post.title.toLowerCase().includes(search) ||
      post.summary.toLowerCase().includes(search) ||
      post.tags.some((tag) => tag.toLowerCase().includes(search));
    const inTag = !activeTag.value || post.tags.includes(activeTag.value);
    return inKeyword && inTag;
  });
});

onMounted(async () => {
  reviewPosts.value = await getPostsByCategory('review');
});
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">学习读后感</h1>
    <p class="text-gray-600 dark:text-gray-300">整理我的读书笔记、课程总结和阶段性反思。</p>

    <a-card>
      <div class="grid gap-3 md:grid-cols-[1fr_auto]">
        <a-input v-model:value="keyword" placeholder="搜索标题、摘要、标签" allow-clear />
        <a-select v-model:value="activeTag" class="min-w-52" allow-clear placeholder="按标签筛选">
          <a-select-option v-for="tag in allTags" :key="tag" :value="tag">
            {{ tag }}
          </a-select-option>
        </a-select>
      </div>
    </a-card>

    <a-card v-for="post in filteredPosts" :key="post.slug" class="rounded-xl">
      <RouterLink
        :to="`/post/${post.slug}`"
        class="text-xl font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100"
      >
        {{ post.title }}
      </RouterLink>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ post.date }}</p>
      <p class="mt-3 text-gray-700 dark:text-gray-300">{{ post.summary }}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <a-tag v-for="tag in post.tags" :key="tag">{{ tag }}</a-tag>
      </div>
    </a-card>

    <a-empty v-if="filteredPosts.length === 0" description="没有匹配的文章" />
  </section>
</template>
