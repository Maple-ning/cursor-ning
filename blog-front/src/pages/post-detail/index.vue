<script setup lang="ts">
import { marked } from 'marked';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

import { getPostBySlug } from '@/services/posts';

const route = useRoute();
const post = ref<Awaited<ReturnType<typeof getPostBySlug>>>(undefined);

const htmlContent = computed(() => marked.parse(post.value?.content ?? ''));

const loadPost = async () => {
  const slug = String(route.params.slug ?? '');
  post.value = await getPostBySlug(slug);
};

onMounted(loadPost);
watch(() => route.params.slug, loadPost);
</script>

<template>
  <section v-if="post" class="space-y-4">
    <RouterLink to="/" class="text-sm text-blue-600 hover:underline"> 返回首页 </RouterLink>
    <a-card class="dark-mode-card">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ post.title }}</h1>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ post.date }}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <a-tag v-for="tag in post.tags" :key="tag">{{ tag }}</a-tag>
      </div>
      <article class="markdown-body mt-6 text-gray-800 dark:text-gray-200" v-html="htmlContent" />
    </a-card>
  </section>

  <a-result v-else status="404" title="文章不存在" sub-title="请检查文章链接是否正确。">
    <template #extra>
      <RouterLink to="/">
        <a-button type="primary">返回首页</a-button>
      </RouterLink>
    </template>
  </a-result>
</template>
