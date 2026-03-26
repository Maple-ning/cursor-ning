import { http } from '../request';

import type { ProfileApiItem } from '../types';

export const getProfileApi = async (): Promise<ProfileApiItem | null> => {
  const { data } = await http.get<ProfileApiItem | null>('/profile');
  return data;
};
