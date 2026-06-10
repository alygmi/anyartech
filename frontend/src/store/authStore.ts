import { create } from 'zustand'
import type { User } from '@/types'
import { authApi, clearTokens, getAccessToken, setTokens } from '@/lib/axios'
import type { ApiResponse } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  hasRole: (...roles: string[]) => boolean
  canAccessHRIS: () => boolean
  canAccessPurchasing: () => boolean
}

const HRIS_ROLES = ['superadmin', 'admin_hrd', 'admin_cabang', 'karyawan']
const PURCHASING_ROLES = ['superadmin', 'admin_purchasing', 'staff_purchasing', 'admin_cabang']

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const response = await authApi.post('/auth/login', { email, password })
    const { access_token, refresh_token, expires_in } = response.data.data
    setTokens(access_token, refresh_token, expires_in)

    const meResponse = await authApi.get<ApiResponse<User>>('/auth/me')
    set({ user: meResponse.data.data, isAuthenticated: true, isLoading: false })
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authApi.post('/auth/logout', { refresh_token: refreshToken })
      }
    } finally {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  fetchUser: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const response = await authApi.get<ApiResponse<User>>('/auth/me')
      set({ user: response.data.data, isAuthenticated: true, isLoading: false })
    } catch {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  hasRole: (...roles: string[]) => {
    const { user } = get()
    if (!user) return false
    return roles.includes(user.role)
  },

  canAccessHRIS: () => {
    const { user } = get()
    if (!user) return false
    return HRIS_ROLES.includes(user.role)
  },

  canAccessPurchasing: () => {
    const { user } = get()
    if (!user) return false
    return PURCHASING_ROLES.includes(user.role)
  },
}))
