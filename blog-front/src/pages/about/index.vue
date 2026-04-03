<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { getProfile } from '@/services/profile';

const profile = ref<Awaited<ReturnType<typeof getProfile>>>(null);
const displayName = computed(() => profile.value?.name?.trim() || '');
const displayTagline = computed(() => profile.value?.tagline?.trim() || '');
const displayIntro = computed(() => profile.value?.intro?.trim() || '');
const displayFocusPoints = computed(() => profile.value?.focusPoints ?? []);
const displayEmail = computed(() => profile.value?.email?.trim() || '');
const displayGithub = computed(() => profile.value?.github?.trim() || '');

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
  <section class="space-y-5">
    <div class="about-hero rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
      <div class="min-w-0">
        <h1 class="truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{{ displayName || '关于我' }}</h1>
        <p v-if="displayTagline" class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ displayTagline }}</p>
      </div>
      <p v-if="displayIntro" class="mt-5 leading-8 text-slate-700 dark:text-slate-300">{{ displayIntro }}</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <a-card v-if="displayFocusPoints.length > 0" class="about-info-card rounded-xl">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">我在做什么</h2>
        <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li v-for="item in displayFocusPoints" :key="item">{{ item }}</li>
        </ul>
      </a-card>

      <a-card class="about-info-card rounded-xl">
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">联系我</h2>
        <div class="mt-3 space-y-3 text-sm">
          <p class="text-slate-600 dark:text-slate-300">
            邮箱：
            <span class="font-medium text-slate-800 dark:text-slate-100">
              {{ displayEmail || '暂未公开' }}
            </span>
          </p>
          <p class="text-slate-600 dark:text-slate-300">
            GitHub：
            <template v-if="displayGithub">
              <a
                :href="githubHref(displayGithub)"
                target="_blank"
                rel="noreferrer noopener"
                class="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {{ displayGithub }}
              </a>
            </template>
            <span v-else class="font-medium text-slate-500 dark:text-slate-400">暂未公开</span>
          </p>
        </div>
      </a-card>
    </div>
  </section>
</template>

<style scoped>
.about-hero {
  background:
    radial-gradient(1200px 320px at 15% -10%, rgb(191 219 254 / 0.35), transparent 55%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #fff 100%);
}

:deep(.about-info-card.ant-card) {
  border-color: rgb(226 232 240) !important;
  background: #fff !important;
  box-shadow:
    0 1px 2px rgb(15 23 42 / 0.04),
    0 8px 20px -18px rgb(15 23 42 / 0.2);
}

:deep(.about-info-card.ant-card .ant-card-head),
:deep(.about-info-card.ant-card .ant-card-body) {
  background: transparent !important;
}

:global(html.dark) :deep(.about-info-card.ant-card) {
  border-color: rgb(51 65 85 / 0.95) !important;
  background: rgb(2 6 23 / 0.9) !important;
  color: rgb(241 245 249) !important;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.35),
    0 10px 24px -18px rgb(0 0 0 / 0.55);
}

:global(html.dark) :deep(.about-info-card.ant-card .ant-card-head),
:global(html.dark) :deep(.about-info-card.ant-card .ant-card-body) {
  background: rgb(2 6 23 / 0.9) !important;
  border-color: rgb(51 65 85 / 0.95) !important;
}

:global(html.dark) :deep(.about-info-card.ant-card .ant-card-head-title) {
  color: rgb(241 245 249) !important;
}

:global(.dark) .about-hero {
  background:
    radial-gradient(900px 300px at 10% -15%, rgb(37 99 235 / 0.16), transparent 55%),
    linear-gradient(180deg, #111827 0%, #020617 100%);
}

:global(html.dark) .about-hero,
:global(body.dark) .about-hero {
  background:
    radial-gradient(900px 300px at 10% -15%, rgb(37 99 235 / 0.16), transparent 55%),
    linear-gradient(180deg, #111827 0%, #020617 100%) !important;
  border-color: #334155 !important;
}
</style>
