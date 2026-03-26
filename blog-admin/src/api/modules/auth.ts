import { http } from '../request';

import type { LoginResponse } from '../types';

export const loginApi = async (username: string, password: string): Promise<LoginResponse> => {
  const { data } = await http.post<LoginResponse>('/auth/login', { username, password });
  return data;
};
