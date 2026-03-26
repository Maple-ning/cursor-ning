import { http } from '../request';

import type { PostApiItem } from '../types';

export const getPublishedPostsApi = async (): Promise<PostApiItem[]> => {
  const { data } = await http.get<PostApiItem[]>('/posts', {
    params: { status: 'published' },
  });
  return data;
};
