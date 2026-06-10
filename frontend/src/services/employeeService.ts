import { employeeApi } from '@/lib/axios'
import type { ApiResponse, Branch, Employee, PaginatedResponse, Position } from '@/types'

export const employeeService = {
  // Branches
  getBranches: async (params?: Record<string, unknown>) => {
    const res = await employeeApi.get<ApiResponse<PaginatedResponse<Branch>>>('/branches', { params })
    return res.data.data
  },

  getBranchTree: async () => {
    const res = await employeeApi.get<ApiResponse<Branch[]>>('/branches/tree')
    return res.data.data
  },

  getBranch: async (id: number) => {
    const res = await employeeApi.get<ApiResponse<Branch>>(`/branches/${id}`)
    return res.data.data
  },

  getActiveBranches: async () => {
    const res = await employeeApi.get<ApiResponse<Pick<Branch, 'id' | 'name' | 'code'>[]>>('/branches/active')
    return res.data.data
  },

  createBranch: async (data: Partial<Branch>) => {
    const res = await employeeApi.post<ApiResponse<Branch>>('/branches', data)
    return res.data.data
  },

  updateBranch: async (id: number, data: Partial<Branch>) => {
    const res = await employeeApi.put<ApiResponse<Branch>>(`/branches/${id}`, data)
    return res.data.data
  },

  toggleBranchActive: async (id: number) => {
    const res = await employeeApi.patch<ApiResponse<Branch>>(`/branches/${id}/toggle-active`)
    return res.data.data
  },

  // Positions
  getPositions: async (params?: Record<string, unknown>) => {
    const res = await employeeApi.get<ApiResponse<PaginatedResponse<Position>>>('/positions', { params })
    return res.data.data
  },

  getPositionTree: async () => {
    const res = await employeeApi.get<ApiResponse<Position[]>>('/positions/tree')
    return res.data.data
  },

  getPosition: async (id: number) => {
    const res = await employeeApi.get<ApiResponse<Position>>(`/positions/${id}`)
    return res.data.data
  },

  createPosition: async (data: Partial<Position>) => {
    const res = await employeeApi.post<ApiResponse<Position>>('/positions', data)
    return res.data.data
  },

  updatePosition: async (id: number, data: Partial<Position>) => {
    const res = await employeeApi.put<ApiResponse<Position>>(`/positions/${id}`, data)
    return res.data.data
  },

  togglePositionActive: async (id: number) => {
    const res = await employeeApi.patch<ApiResponse<Position>>(`/positions/${id}/toggle-active`)
    return res.data.data
  },

  // Employees
  getEmployees: async (params?: Record<string, unknown>) => {
    const res = await employeeApi.get<ApiResponse<PaginatedResponse<Employee>>>('/employees', { params })
    return res.data.data
  },

  getExpiringContracts: async (days = 30) => {
    const res = await employeeApi.get<ApiResponse<Employee[]>>('/employees/expiring-contracts', {
      params: { days },
    })
    return res.data.data
  },

  getEmployee: async (id: number) => {
    const res = await employeeApi.get<ApiResponse<Employee>>(`/employees/${id}`)
    return res.data.data
  },

  createEmployee: async (data: Partial<Employee>) => {
    const res = await employeeApi.post<ApiResponse<Employee>>('/employees', data)
    return res.data.data
  },

  updateEmployee: async (id: number, data: Partial<Employee>) => {
    const res = await employeeApi.put<ApiResponse<Employee>>(`/employees/${id}`, data)
    return res.data.data
  },

  toggleEmployeeActive: async (id: number) => {
    const res = await employeeApi.patch<ApiResponse<Employee>>(`/employees/${id}/toggle-active`)
    return res.data.data
  },
}
