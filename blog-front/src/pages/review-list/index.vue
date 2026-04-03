<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { getPostsByCategory } from '@/services/posts';

const keyword = ref('');
const activeTag = ref<string | undefined>(undefined);
const reviewPosts = ref<Awaited<ReturnType<typeof getPostsByCategory>>>([]);
const router = useRouter();

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
    const inKeyword = search.length === 0 || post.title.toLowerCase().includes(search);
    const inTag = !activeTag.value || post.tags.includes(activeTag.value);
    return inKeyword && inTag;
  });
});

onMounted(async () => {
  reviewPosts.value = await getPostsByCategory('review');
});

const goDetail = (slug: string) => {
  void router.push({ name: 'post-detail', params: { slug } });
};
</script>

<template>
  <section class="space-y-4">
    <div
      class="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-100/95 pb-2 pt-1 dark:border-slate-700/70 dark:bg-gray-950/95"
    >
      <a-card>
        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <a-input v-model:value="keyword" placeholder="搜索标题" allow-clear />
          <a-select v-model:value="activeTag" class="min-w-52" allow-clear placeholder="按标签筛选">
            <a-select-option v-for="tag in allTags" :key="tag" :value="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </div>
      </a-card>
    </div>

    <div class="mt-5 flex flex-col gap-4">
      <a-card
        v-for="post in filteredPosts"
        :key="post.slug"
        class="blog-card-lift cursor-pointer rounded-xl transition hover:ring-1 hover:ring-blue-200"
        tabindex="0"
        role="button"
        @click="goDetail(post.slug)"
        @keydown.enter.prevent="goDetail(post.slug)"
      >
        <div class="flex justify-between">
          <RouterLink
            :to="{ name: 'post-detail', params: { slug: post.slug } }"
            class="text-xl font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
          >
            {{ post.title }}
          </RouterLink>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ post.date }}</p>
        </div>
        <p class="mt-3 text-gray-700 dark:text-gray-300">{{ post.summary }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <a-tag v-for="tag in post.tags" :key="tag">{{ tag }}</a-tag>
        </div>
      </a-card>
    </div>

    <a-empty v-if="filteredPosts.length === 0" description="没有匹配的文章" />
  </section>
</template>
