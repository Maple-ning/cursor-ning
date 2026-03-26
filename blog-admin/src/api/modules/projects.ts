import type { AdminProject } from '@/types/content';

import { http } from '../request';

export const getProjectsApi = async (): Promise<AdminProject[]> => {
  const { data } = await http.get<AdminProject[]>('/projects');
  return data;
};

export const createProjectApi = async (payload: Omit<AdminProject, 'id'>) => {
  const { data } = await http.post('/projects', payload);
  return data;
};

export const updateProjectApi = async (id: number, payload: Omit<AdminProject, 'id'>) => {
  const { data } = await http.put(`/projects/${id}`, payload);
  return data;
};

export const deleteProjectApi = async (id: number) => {
  const { data } = await http.delete(`/projects/${id}`);
  return data;
};
