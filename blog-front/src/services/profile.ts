import { getProfileApi } from '@/api/modules/profile';

export interface ProfileItem {
  name: string;
  tagline: string;
  intro: string;
  focusPoints: string[];
  email: string;
  github: string;
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

export const getProfile = async (): Promise<ProfileItem | null> => {
  const payload = await getProfileApi();
  if (!payload) return null;
  return {
    name: String(payload.name ?? ''),
    tagline: String(payload.tagline ?? ''),
    intro: String(payload.intro ?? ''),
    focusPoints: toStringArray(payload.focus_points),
    email: String(payload.email ?? ''),
    github: String(payload.github ?? ''),
  };
};
