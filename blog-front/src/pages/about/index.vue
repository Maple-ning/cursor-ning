<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { getProfile } from '@/services/profile'

const profile = ref<Awaited<ReturnType<typeof getProfile>>>(null)

onMounted(async () => {
  profile.value = await getProfile()
})
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold text-gray-900">关于我</h1>
    <a-card>
      <p class="leading-8 text-gray-700">
        {{ profile?.intro || '我是一名前端开发学习者，专注 Vue3 + TypeScript 技术栈。这个博客用于记录我的技术实践、学习读后感，以及一些个人项目沉淀。' }}
      </p>
      <p class="mt-4 text-gray-600">
        {{ profile?.email ? `联系邮箱：${profile.email}` : '你可以把这里当作我的公开学习日志。欢迎交流。' }}
      </p>
      <p v-if="profile?.github" class="mt-2 text-gray-600">
        GitHub：{{ profile.github }}
      </p>
    </a-card>
  </section>
</template>
