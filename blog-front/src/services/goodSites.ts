import { getGoodSitesApi } from '@/api/modules/goodSites';

export interface GoodSiteItem {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  sortOrder: number;
}

export const getGoodSites = async (): Promise<GoodSiteItem[]> => {
  const rows = await getGoodSitesApi();
  return rows.map((item) => ({
    id: Number(item.id),
    title: String(item.title ?? ''),
    url: String(item.url ?? ''),
    description: String(item.description ?? ''),
    category: String(item.category ?? ''),
    sortOrder: Number(item.sort_order ?? 0),
  }));
};
