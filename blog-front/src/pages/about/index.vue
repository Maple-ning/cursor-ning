<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getProfile } from '@/services/profile';

const profile = ref<Awaited<ReturnType<typeof getProfile>>>(null);

/** 支持填写 github.com/foo 或完整 https URL */
const githubHref = (raw: string) => {
  const u = raw.trim();
  if (!u) return '#';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
};

onMounted(async () => {
  profile.value = await getProfile();
});
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">关于我</h1>
    <a-card>
      <p class="leading-8 text-gray-700 dark:text-gray-300">
        {{
          profile?.intro ||
          '我是一名前端开发学习者，专注 Vue3 + TypeScript 技术栈。枫叶小站用于记录我的技术实践、学习读后感，以及一些个人项目沉淀。'
        }}
      </p>
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        {{
          profile?.email
            ? `联系邮箱：${profile.email}`
            : '你可以把这里当作我的公开学习日志。欢迎交流。'
        }}
      </p>
      <p v-if="profile?.github?.trim()" class="mt-4 text-gray-600 dark:text-gray-300">
        <a
          :href="githubHref(profile.github)"
          target="_blank"
          rel="noreferrer noopener"
          class="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          我的 GitHub
        </a>
      </p>
    </a-card>
  </section>
</template>
