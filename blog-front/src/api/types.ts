export interface PostApiItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  tags: unknown;
  date: string;
  category: 'tech' | 'review';
  status: 'draft' | 'published';
}

export interface ProfileApiItem {
  name: string;
  tagline?: string;
  intro: string;
  focus_points?: unknown;
  email: string;
  github: string;
}

export interface ProjectApiItem {
  id: number;
  name: string;
  description: string;
  tech_stack: unknown;
  url: string;
  source_code_url?: string | null;
}

export interface GoodSiteApiItem {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  sort_order: number;
}
