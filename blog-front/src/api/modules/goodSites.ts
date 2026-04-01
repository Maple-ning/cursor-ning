import { http } from '../request';

import type { GoodSiteApiItem } from '../types';

export const getGoodSitesApi = async (): Promise<GoodSiteApiItem[]> => {
  const { data } = await http.get<GoodSiteApiItem[]>('/profile/good-sites');
  return data;
};
