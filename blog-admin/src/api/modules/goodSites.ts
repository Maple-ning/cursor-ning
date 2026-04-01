import type { AdminGoodSite } from '@/types/content';

import { http } from '../request';

export const getGoodSitesApi = async (): Promise<AdminGoodSite[]> => {
  const { data } = await http.get<Record<string, unknown>[]>('/profile/good-sites');
  return data.map((row) => ({
    id: Number(row.id),
    title: String(row.title ?? ''),
    url: String(row.url ?? ''),
    description: String(row.description ?? ''),
    category: String(row.category ?? ''),
    sortOrder: Number(row.sort_order ?? 0),
  }));
};

export const createGoodSiteApi = async (payload: Omit<AdminGoodSite, 'id'>) => {
  const { data } = await http.post('/profile/good-sites', payload);
  return data;
};

export const updateGoodSiteApi = async (id: number, payload: Omit<AdminGoodSite, 'id'>) => {
  const { data } = await http.put(`/profile/good-sites/${id}`, payload);
  return data;
};

export const deleteGoodSiteApi = async (id: number) => {
  const { data } = await http.delete(`/profile/good-sites/${id}`);
  return data;
};
