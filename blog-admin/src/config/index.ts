export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api-blog',
  appTitle: import.meta.env.VITE_APP_TITLE || '枫叶小站后台',
  requestTimeout: 10_000,
} as const;
