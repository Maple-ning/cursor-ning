import { STORAGE_REFRESH_TOKEN_KEY, STORAGE_TOKEN_KEY } from '@/constants/storageKeys';

export const getToken = (): string => localStorage.getItem(STORAGE_TOKEN_KEY) || '';

export const setToken = (token: string) => {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
};

export const getRefreshToken = (): string => localStorage.getItem(STORAGE_REFRESH_TOKEN_KEY) || '';

export const setRefreshToken = (token: string) => {
  localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
};

export const isLoggedIn = (): boolean => Boolean(getToken());
