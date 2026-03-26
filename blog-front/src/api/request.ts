import { message } from 'ant-design-vue';
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@/config';

export const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
});

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const isMutationRequest = (config?: InternalAxiosRequestConfig) => {
  const method = config?.method?.toLowerCase();
  return !!method && MUTATION_METHODS.has(method);
};

const getMutationFallbackMessage = (method?: string) => {
  const normalized = method?.toLowerCase();
  if (normalized === 'post') return '提交成功';
  if (normalized === 'put' || normalized === 'patch') return '保存成功';
  if (normalized === 'delete') return '删除成功';
  return '操作成功';
};

const getErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || '操作失败，请稍后重试';
};

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isMutationRequest(response.config)) {
      const serverMessage = response.data?.message;
      message.success(serverMessage || getMutationFallbackMessage(response.config.method));
    }
    return response;
  },
  (error) => {
    const original = error?.config as InternalAxiosRequestConfig | undefined;
    if (isMutationRequest(original)) {
      message.error(getErrorMessage(error));
    }
    return Promise.reject(error);
  }
);
