<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import HomeWelcomeHero from '@/components/home/HomeWelcomeHero.vue';
import { getPostsByCategory } from '@/services/posts';
import { getProfile } from '@/services/profile';
import { getProjects } from '@/services/projects';

const techPosts = ref<Awaited<ReturnType<typeof getPostsByCategory>>>([]);
const reviewPosts = ref<Awaited<ReturnType<typeof getPostsByCategory>>>([]);
const projects = ref<Awaited<ReturnType<typeof getProjects>>>([]);
const profile = ref<{ name: string; intro: string } | null>(null);

const latestTechPosts = computed(() => techPosts.value.slice(0, 3));
const latestReviewPosts = computed(() => reviewPosts.value.slice(0, 2));
const featuredProjects = computed(() => projects.value.slice(0, 3));

onMounted(async () => {
  const [tech, review, projectList, profileInfo] = await Promise.all([
    getPostsByCategory('tech'),
    getPostsByCategory('review'),
    getProjects(),
    getProfile(),
  ]);
  techPosts.value = tech;
  reviewPosts.value = review;
  projects.value = projectList;
  profile.value = profileInfo ? { name: profileInfo.name, intro: profileInfo.intro } : null;
});
</script>

<template>
  <section class="grid gap-6">
    <a-card class="home-section-card overflow-hidden" :body-style="{ padding: 0 }">
      <HomeWelcomeHero />
      <div
        class="home-hero-body px-5 py-6 md:px-6 md:py-7 dark:border-t dark:border-slate-700 dark:!bg-gradient-to-b dark:!from-slate-900/95 dark:!to-gray-900"
      >
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          你好，我是 {{ profile?.name || 'Ning' }}
        </h1>
        <p class="mt-3 text-gray-600 dark:text-gray-300">
          {{ profile?.intro || '这里会持续更新我的技术分享、读书学习笔记，以及个人项目展示。' }}
        </p>
        <div class="mt-5 flex flex-wrap gap-3">
          <RouterLink :to="{ name: 'projects' }">
            <a-button ghost>看项目展示</a-button>
          </RouterLink>
        </div>
      </div>
    </a-card>

    <a-card title="最新技术分享" class="home-section-card">
      <div class="space-y-4">
        <article
          v-for="post in latestTechPosts"
          :key="post.slug"
          class="blog-card-lift rounded-lg border border-gray-200 bg-white/80 p-4 dark:border-slate-600 dark:bg-slate-800/60"
        >
          <div class="flex justify-between">
            <RouterLink
              :to="{ name: 'post-detail', params: { slug: post.slug } }"
              class="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
              {{ post.title }}
            </RouterLink>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ post.date }}</p>
          </div>
          <p class="mt-2 text-gray-700 dark:text-gray-300">{{ post.summary }}</p>
        </article>
        <a-empty v-if="latestTechPosts.length === 0" description="暂无内容" />
      </div>
    </a-card>

    <a-card title="最近读后感" class="home-section-card">
      <div class="space-y-4">
        <article
          v-for="post in latestReviewPosts"
          :key="post.slug"
          class="blog-card-lift rounded-lg border border-gray-200 bg-white/80 p-4 dark:border-slate-600 dark:bg-slate-800/60"
        >
          <div class="flex justify-between">
            <RouterLink
              :to="{ name: 'post-detail', params: { slug: post.slug } }"
              class="text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
            >
              {{ post.title }}
            </RouterLink>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ post.date }}</p>
          </div>

          <p class="mt-2 text-gray-700 dark:text-gray-300">{{ post.summary }}</p>
        </article>
        <a-empty v-if="latestReviewPosts.length === 0" description="暂无内容" />
      </div>
    </a-card>

    <a-card title="我的项目" class="home-section-card">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a-card
          v-for="project in featuredProjects"
          :key="project.name"
          size="small"
          class="blog-card-lift h-full"
        >
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ project.name }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ project.description }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <a-tag v-for="tech in project.techStack" :key="tech" color="blue">
              {{ tech }}
            </a-tag>
          </div>
        </a-card>
      </div>
      <a-empty v-if="featuredProjects.length === 0" description="暂无内容" />
    </a-card>
  </section>
</template>

<style scoped>
.home-hero-body {
  border-top: 1px solid rgba(226, 232, 240, 0.95);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, #fff 100%);
}
</style>
