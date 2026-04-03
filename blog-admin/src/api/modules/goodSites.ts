import type { AdminGoodSite } from '@/types/content';

import { http } from '../request';

export interface GoodSitesListPayload {
  items: AdminGoodSite[];
  categoryOrder: string[];
}

const unwrapGoodSitesBody = (raw: unknown): unknown => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    if ('items' in d || 'categoryOrder' in d || 'category_order' in d) return inner;
  }
  return raw;
};

const mapRow = (row: Record<string, unknown>): AdminGoodSite => ({
  id: Number(row.id),
  title: String(row.title ?? ''),
  url: String(row.url ?? ''),
  description: String(row.description ?? ''),
  category: String(row.category ?? ''),
  sortOrder: Number(row.sort_order ?? 0),
});

export const getGoodSitesApi = async (): Promise<GoodSitesListPayload> => {
  const { data } = await http.get<unknown>('/profile/good-sites');
  const body = unwrapGoodSitesBody(data);
  if (Array.isArray(body)) {
    return {
      items: body.map((row) => mapRow(row as Record<string, unknown>)),
      categoryOrder: [],
    };
  }
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    const rawItems = o.items;
    const items = Array.isArray(rawItems)
      ? rawItems.map((row) => mapRow(row as Record<string, unknown>))
      : [];
    const rawOrder = o.categoryOrder ?? o.category_order;
    const categoryOrder = Array.isArray(rawOrder) ? rawOrder.map((c) => String(c)) : [];
    return { items, categoryOrder };
  }
  return { items: [], categoryOrder: [] };
};

export const updateGoodSiteCategoryOrderApi = async (order: string[]) => {
  const { data } = await http.put('/profile/good-sites/category-order', { order });
  return data;
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
