import { authApi } from '@/lib/axios'
import type { ApiResponse, PaginatedResponse, User } from '@/types'

export const authService = {
  getUsers: async (params?: Record<string, unknown>) => {
    const res = await authApi.get<ApiResponse<PaginatedResponse<User>>>('/users', { params })
    return res.data.data
  },

  getUser: async (id: number) => {
    const res = await authApi.get<ApiResponse<User>>(`/users/${id}`)
    return res.data.data
  },

  createUser: async (data: Partial<User> & { password: string }) => {
    const res = await authApi.post<ApiResponse<User>>('/users', data)
    return res.data.data
  },

  updateUser: async (id: number, data: Partial<User> & { password?: string }) => {
    const res = await authApi.put<ApiResponse<User>>(`/users/${id}`, data)
    return res.data.data
  },

  toggleUserActive: async (id: number) => {
    const res = await authApi.patch<ApiResponse<User>>(`/users/${id}/toggle-active`)
    return res.data.data
  },
}
