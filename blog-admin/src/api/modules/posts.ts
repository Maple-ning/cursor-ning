import type { AdminPost } from '@/types/content';

import { http } from '../request';

export const getPostsApi = async (): Promise<AdminPost[]> => {
  const { data } = await http.get<AdminPost[]>('/posts');
  return data;
};

export const createPostApi = async (payload: Omit<AdminPost, 'id'>) => {
  const { data } = await http.post('/posts', payload);
  return data;
};

export const updatePostApi = async (id: number, payload: Omit<AdminPost, 'id'>) => {
  const { data } = await http.put(`/posts/${id}`, payload);
  return data;
};

export const deletePostApi = async (id: number) => {
  const { data } = await http.delete(`/posts/${id}`);
  return data;
};
