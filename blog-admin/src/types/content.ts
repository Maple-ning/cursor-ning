export type PostCategory = 'tech' | 'review';
export type PostStatus = 'draft' | 'published';

export interface AdminPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  category: PostCategory;
  status: PostStatus;
}

export interface AdminProject {
  id: number;
  name: string;
  description: string;
  url: string;
  sourceCodeUrl: string;
  techStack: string[];
}

export interface AboutProfile {
  name: string;
  tagline: string;
  intro: string;
  focusPoints: string[];
  email: string;
  github: string;
}

export interface AdminGoodSite {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  sortOrder: number;
}
