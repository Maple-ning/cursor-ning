import type { AboutProfile, AdminPost, AdminProject } from '@/types/content'

export const defaultPosts: AdminPost[] = [
  {
    id: 1,
    title: 'Vue3 + TypeScript 组件拆分实践',
    summary: '记录了中型项目里的组件拆分原则和目录组织方法。',
    content: '正文内容...',
    tags: ['Vue3', 'TypeScript'],
    date: '2026-03-24',
    category: 'tech',
    status: 'published',
  },
  {
    id: 2,
    title: '《深度工作》观后感',
    summary: '如何减少上下文切换，提高深度学习效率。',
    content: '正文内容...',
    tags: ['读后感', '效率'],
    date: '2026-03-20',
    category: 'review',
    status: 'draft',
  },
]

export const defaultProjects: AdminProject[] = [
  {
    id: 1,
    name: '个人博客前台',
    description: '用于展示技术文章、读后感和项目卡片。',
    url: 'https://github.com/',
    techStack: ['Vue3', 'Vite', 'Tailwind'],
  },
]

export const defaultAbout: AboutProfile = {
  name: 'Ning',
  intro: '前端开发者，关注 Vue 工程化与效率工具。',
  email: 'ning@example.com',
  github: 'https://github.com/',
}
