import { ref } from 'vue';

import { createPostApi, deletePostApi, getPostsApi, updatePostApi } from '@/api/modules/posts';
import { getProfileApi, saveProfileApi } from '@/api/modules/profile';
import {
  createGoodSiteApi,
  deleteGoodSiteApi,
  getGoodSitesApi,
  updateGoodSiteApi,
} from '@/api/modules/goodSites';
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi,
} from '@/api/modules/projects';
import type {
  AboutProfile,
  AdminGoodSite,
  AdminPost,
  AdminProject,
  PostCategory,
  PostStatus,
} from '@/types/content';

const posts = ref<AdminPost[]>([]);
const projects = ref<AdminProject[]>([]);
const goodSites = ref<AdminGoodSite[]>([]);
const about = ref<AboutProfile>({
  name: '',
  intro: '',
  email: '',
  github: '',
});
const initialized = ref(false);
let pendingInit: Promise<void> | null = null;

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizePost = (item: unknown): AdminPost => {
  const o = item as Record<string, unknown>;
  return {
    id: Number(o.id),
    title: String(o.title ?? ''),
    summary: String(o.summary ?? ''),
    content: String(o.content ?? ''),
    tags: toStringArray(o.tags),
    date: String(o.date ?? '').slice(0, 10),
    category: o.category === 'review' ? 'review' : 'tech',
    status: o.status === 'published' ? 'published' : 'draft',
  };
};

const normalizeProject = (item: unknown): AdminProject => {
  const o = item as Record<string, unknown>;
  return {
    id: Number(o.id),
    name: String(o.name ?? ''),
    description: String(o.description ?? ''),
    url: String(o.url ?? ''),
    techStack: toStringArray(o.tech_stack),
  };
};

const loadAll = async () => {
  const [postsRes, projectsRes, profileRes, goodSitesRes] = await Promise.all([
    getPostsApi(),
    getProjectsApi(),
    getProfileApi(),
    getGoodSitesApi(),
  ]);
  posts.value = postsRes.map(normalizePost);
  projects.value = projectsRes.map(normalizeProject);
  goodSites.value = goodSitesRes;
  if (profileRes) {
    about.value = {
      name: String(profileRes.name ?? ''),
      intro: String(profileRes.intro ?? ''),
      email: String(profileRes.email ?? ''),
      github: String(profileRes.github ?? ''),
    };
  }
};

const ensureInit = async () => {
  if (initialized.value) return;
  if (pendingInit) return pendingInit;
  pendingInit = loadAll().finally(() => {
    pendingInit = null;
  });
  await pendingInit;
  initialized.value = true;
};

export const useBlogAdmin = () => {
  const init = () => ensureInit();

  const upsertPost = async (payload: Omit<AdminPost, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updatePostApi(payload.id, payload);
    } else {
      await createPostApi(payload);
    }
    await loadAll();
  };

  const deletePost = async (id: number) => {
    await deletePostApi(id);
    await loadAll();
  };

  const upsertProject = async (payload: Omit<AdminProject, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updateProjectApi(payload.id, payload);
    } else {
      await createProjectApi(payload);
    }
    await loadAll();
  };

  const deleteProject = async (id: number) => {
    await deleteProjectApi(id);
    await loadAll();
  };

  const upsertGoodSite = async (payload: Omit<AdminGoodSite, 'id'> & { id?: number }) => {
    if (payload.id) {
      await updateGoodSiteApi(payload.id, payload);
    } else {
      await createGoodSiteApi(payload);
    }
    await loadAll();
  };

  const deleteGoodSite = async (id: number) => {
    await deleteGoodSiteApi(id);
    await loadAll();
  };

  const saveAbout = async (payload: AboutProfile) => {
    await saveProfileApi(payload);
    await loadAll();
  };

  const postsByCategory = (category: PostCategory) =>
    posts.value.filter((item) => item.category === category);
  const postsByStatus = (status: PostStatus) =>
    posts.value.filter((item) => item.status === status);

  return {
    posts,
    projects,
    goodSites,
    about,
    init,
    loadAll,
    postsByCategory,
    postsByStatus,
    upsertPost,
    deletePost,
    upsertProject,
    deleteProject,
    upsertGoodSite,
    deleteGoodSite,
    saveAbout,
  };
};
