export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  appTitle: import.meta.env.VITE_APP_TITLE || '博客',
  requestTimeout: 10_000,
} as const;
