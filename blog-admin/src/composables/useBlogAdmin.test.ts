import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPostsApi } from '@/api/modules/posts';
import { getProfileApi } from '@/api/modules/profile';
import { getProjectsApi } from '@/api/modules/projects';
import { useBlogAdmin } from '@/composables/useBlogAdmin';

vi.mock('@/api/modules/posts', () => ({
  createPostApi: vi.fn(),
  deletePostApi: vi.fn(),
  getPostsApi: vi.fn(),
  updatePostApi: vi.fn(),
}));

vi.mock('@/api/modules/projects', () => ({
  createProjectApi: vi.fn(),
  deleteProjectApi: vi.fn(),
  getProjectsApi: vi.fn(),
  updateProjectApi: vi.fn(),
}));

vi.mock('@/api/modules/profile', () => ({
  getProfileApi: vi.fn(),
  saveProfileApi: vi.fn(),
}));

describe('useBlogAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and normalizes posts/projects/profile', async () => {
    vi.mocked(getPostsApi).mockResolvedValue([
      {
        id: 10,
        title: 'post',
        summary: 'summary',
        content: 'content',
        tags: '["vue"]',
        date: '2026-03-01T12:00:00.000Z',
        category: 'tech',
        status: 'published',
      },
    ] as never);
    vi.mocked(getProjectsApi).mockResolvedValue([
      {
        id: 1,
        name: 'project',
        description: 'desc',
        url: 'https://example.com',
        tech_stack: '["vue","ts"]',
      },
    ] as never);
    vi.mocked(getProfileApi).mockResolvedValue({
      name: 'Ning',
      intro: 'intro',
      email: 'ning@example.com',
      github: 'https://github.com/ning',
    } as never);

    const admin = useBlogAdmin();
    await admin.init();

    expect(admin.posts.value[0]?.tags).toEqual(['vue']);
    expect(admin.projects.value[0]?.techStack).toEqual(['vue', 'ts']);
    expect(admin.about.value.name).toBe('Ning');
    expect(admin.postsByStatus('published')).toHaveLength(1);
  });
});
