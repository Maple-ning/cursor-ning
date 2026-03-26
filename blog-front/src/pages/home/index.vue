<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

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
    <a-card class="home-section-card">
      <h1 class="text-3xl font-bold text-gray-900">你好，我是 {{ profile?.name || 'Ning' }}</h1>
      <p class="mt-3 text-gray-600">
        {{ profile?.intro || '这里会持续更新我的技术分享、读书学习笔记，以及个人项目展示。' }}
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <RouterLink to="/posts/tech">
          <a-button type="primary">看技术分享</a-button>
        </RouterLink>
        <RouterLink to="/projects">
          <a-button>看项目展示</a-button>
        </RouterLink>
      </div>
    </a-card>

    <a-card title="最新技术分享" class="home-section-card">
      <div class="space-y-4">
        <article
          v-for="post in latestTechPosts"
          :key="post.slug"
          class="rounded-lg border border-gray-200 p-4"
        >
          <RouterLink
            :to="`/post/${post.slug}`"
            class="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {{ post.title }}
          </RouterLink>
          <p class="mt-2 text-sm text-gray-500">{{ post.date }}</p>
          <p class="mt-2 text-gray-700">{{ post.summary }}</p>
        </article>
      </div>
    </a-card>

    <a-card title="最近读后感" class="home-section-card">
      <div class="space-y-4">
        <article
          v-for="post in latestReviewPosts"
          :key="post.slug"
          class="rounded-lg border border-gray-200 p-4"
        >
          <RouterLink
            :to="`/post/${post.slug}`"
            class="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {{ post.title }}
          </RouterLink>
          <p class="mt-2 text-sm text-gray-500">{{ post.date }}</p>
          <p class="mt-2 text-gray-700">{{ post.summary }}</p>
        </article>
      </div>
    </a-card>

    <a-card title="精选项目" class="home-section-card">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <a-card v-for="project in featuredProjects" :key="project.name" size="small" class="h-full">
          <h3 class="text-base font-semibold text-gray-900">{{ project.name }}</h3>
          <p class="mt-2 text-sm text-gray-600">{{ project.description }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <a-tag v-for="tech in project.techStack" :key="tech" color="blue">
              {{ tech }}
            </a-tag>
          </div>
        </a-card>
      </div>
    </a-card>
  </section>
</template>
