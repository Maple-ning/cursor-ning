import { getProjectsApi } from '@/api/modules/projects';

export interface ProjectItem {
  id: number;
  name: string;
  description: string;
  techStack: string[];
  url: string;
}

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

export const getProjects = async (): Promise<ProjectItem[]> => {
  const payload = await getProjectsApi();
  return payload.map((item) => ({
    id: Number(item.id),
    name: String(item.name ?? ''),
    description: String(item.description ?? ''),
    techStack: toStringArray(item.tech_stack),
    url: String(item.url ?? ''),
  }));
};
