import { message } from 'ant-design-vue'
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

import { appConfig } from '@/config'
import { clearToken, getRefreshToken, getToken, setToken } from '@/utils/auth'

export const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.requestTimeout,
})

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete'])

const isMutationRequest = (config?: InternalAxiosRequestConfig) => {
  const method = config?.method?.toLowerCase()
  return !!method && MUTATION_METHODS.has(method)
}

const getMutationFallbackMessage = (method?: string) => {
  const normalized = method?.toLowerCase()
  if (normalized === 'post') return '提交成功'
  if (normalized === 'put' || normalized === 'patch') return '保存成功'
  if (normalized === 'delete') return '删除成功'
  return '操作成功'
}

const getErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err?.response?.data?.message || err?.message || '操作失败，请稍后重试'
}

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await axios.post<{ token: string }>(
          `${appConfig.apiBaseUrl}/auth/refresh`,
          { refreshToken },
        )
        const nextToken = response.data?.token
        if (!nextToken) return null
        setToken(nextToken)
        return nextToken
      } catch {
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isMutationRequest(response.config)) {
      const serverMessage = response.data?.message
      message.success(serverMessage || getMutationFallbackMessage(response.config.method))
    }
    return response
  },
  async (error) => {
    const original = error.config
    if (!original) throw error
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const nextToken = await refreshAccessToken()
      if (nextToken) {
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${nextToken}`
        return http(original)
      }
      clearToken()
      if (typeof window !== 'undefined') window.location.href = '/admin/login'
    }
    if (isMutationRequest(original)) {
      message.error(getErrorMessage(error))
    }
    throw error
  },
)
