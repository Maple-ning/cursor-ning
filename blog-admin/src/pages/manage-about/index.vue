<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue';

import { useBlogAdmin } from '@/composables/useBlogAdmin';

const { about, saveAbout, init } = useBlogAdmin();

const githubPreviewHref = (raw: string) => {
  const u = raw.trim();
  if (!u) return '#';
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
};

const form = reactive({
  name: about.value.name,
  intro: about.value.intro,
  email: about.value.email,
  github: about.value.github,
});

const submit = async () => {
  await saveAbout({
    name: form.name,
    intro: form.intro,
    email: form.email,
    github: form.github,
  });
};

watch(
  about,
  (value) => {
    form.name = value.name;
    form.intro = value.intro;
    form.email = value.email;
    form.github = value.github;
  },
  { immediate: true }
);

onMounted(init);
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1fr_1fr]">
    <a-card title="编辑关于我">
      <div class="grid gap-3">
        <a-input v-model:value="form.name" placeholder="昵称" />
        <a-input v-model:value="form.email" placeholder="邮箱" />
        <a-input v-model:value="form.github" placeholder="GitHub 主页，如 github.com/你的用户名" />
        <a-textarea v-model:value="form.intro" :rows="6" placeholder="个人介绍" />
        <a-button type="primary" @click="submit">保存</a-button>
      </div>
    </a-card>

    <a-card title="预览">
      <p class="text-xl font-semibold text-gray-900">{{ about.name }}</p>
      <p class="mt-2 text-gray-700">{{ about.intro }}</p>
      <p class="mt-3 text-sm text-gray-600">邮箱：{{ about.email }}</p>
      <p v-if="about.github?.trim()" class="mt-2 text-sm text-gray-600">
        GitHub：
        <a
          :href="githubPreviewHref(about.github)"
          target="_blank"
          rel="noreferrer noopener"
          class="text-blue-600 hover:underline"
        >
          {{ about.github }}
        </a>
      </p>
    </a-card>
  </section>
</template>
