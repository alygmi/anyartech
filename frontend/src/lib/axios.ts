import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api'

const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const EXPIRES_KEY = 'token_expires_at'

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  const expiresAt = Date.now() + expiresIn * 1000 - 60000
  localStorage.setItem(EXPIRES_KEY, String(expiresAt))
}

export function setAccessToken(token: string, expiresIn: number) {
  localStorage.setItem(TOKEN_KEY, token)
  const expiresAt = Date.now() + expiresIn * 1000 - 60000
  localStorage.setItem(EXPIRES_KEY, String(expiresAt))
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_KEY)
}

export function isTokenExpiringSoon(): boolean {
  const expiresAt = localStorage.getItem(EXPIRES_KEY)
  if (!expiresAt) return false
  return Date.now() >= Number(expiresAt)
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  const response = await axios.post(`${API_CONFIG.auth}/auth/refresh`, {
    refresh_token: refreshToken,
  })

  const { access_token, expires_in } = response.data.data
  setAccessToken(access_token, expires_in)
  return access_token
}

function createApiClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (isTokenExpiringSoon()) {
      try {
        if (!isRefreshing) {
          isRefreshing = true
          const newToken = await refreshAccessToken()
          isRefreshing = false
          onTokenRefreshed(newToken)
        } else {
          await new Promise<void>((resolve) => {
            subscribeTokenRefresh(() => resolve())
          })
        }
      } catch {
        isRefreshing = false
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(new Error('Session expired'))
      }
    }

    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          if (!isRefreshing) {
            isRefreshing = true
            const newToken = await refreshAccessToken()
            isRefreshing = false
            onTokenRefreshed(newToken)
          } else {
            await new Promise<void>((resolve) => {
              subscribeTokenRefresh(() => resolve())
            })
          }

          const token = getAccessToken()
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return client(originalRequest)
        } catch {
          isRefreshing = false
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      if (error.response?.status === 403) {
        window.location.href = '/forbidden'
      }

      if (error.response?.status && error.response.status >= 500) {
        const message = (error.response.data as { message?: string })?.message || 'Terjadi kesalahan server'
        throw new Error(message)
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const authApi = createApiClient(API_CONFIG.auth)
export const employeeApi = createApiClient(API_CONFIG.employee)
export const purchaseApi = createApiClient(API_CONFIG.purchase)
