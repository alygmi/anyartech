import { purchaseApi } from '@/lib/axios'
import type {
  ApiResponse,
  Item,
  PaginatedResponse,
  PurchaseOrder,
  PurchaseOrderItem,
  Vendor,
} from '@/types'

export const purchaseService = {
  // Vendors
  getVendors: async (params?: Record<string, unknown>) => {
    const res = await purchaseApi.get<PaginatedResponse<Vendor>>('/vendors', { params })
    return res.data
  },

  getVendor: async (id: number) => {
    const res = await purchaseApi.get<ApiResponse<Vendor>>(`/vendors/${id}`)
    return res.data.data
  },

  createVendor: async (data: Partial<Vendor>) => {
    const res = await purchaseApi.post<ApiResponse<Vendor>>('/vendors', data)
    return res.data.data
  },

  updateVendor: async (id: number, data: Partial<Vendor>) => {
    const res = await purchaseApi.put<ApiResponse<Vendor>>(`/vendors/${id}`, data)
    return res.data.data
  },

  deleteVendor: async (id: number) => {
    await purchaseApi.delete(`/vendors/${id}`)
  },

  getVendorPurchaseHistory: async (id: number, params?: Record<string, unknown>) => {
    const res = await purchaseApi.get<PaginatedResponse<PurchaseOrder>>(
      `/vendors/${id}/purchase-history`,
      { params }
    )
    return res.data
  },

  // Items
  getItems: async (params?: Record<string, unknown>) => {
    const res = await purchaseApi.get<PaginatedResponse<Item>>('/items', { params })
    return res.data
  },

  getItem: async (id: number) => {
    const res = await purchaseApi.get<ApiResponse<Item>>(`/items/${id}`)
    return res.data.data
  },

  createItem: async (data: Partial<Item>) => {
    const res = await purchaseApi.post<ApiResponse<Item>>('/items', data)
    return res.data.data
  },

  updateItem: async (id: number, data: Partial<Item>) => {
    const res = await purchaseApi.put<ApiResponse<Item>>(`/items/${id}`, data)
    return res.data.data
  },

  deleteItem: async (id: number) => {
    await purchaseApi.delete(`/items/${id}`)
  },

  // Purchase Orders
  getPurchaseOrders: async (params?: Record<string, unknown>) => {
    const res = await purchaseApi.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', {
      params,
    })
    return res.data
  },

  getPurchaseOrder: async (id: number) => {
    const res = await purchaseApi.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`)
    return res.data.data
  },

  createPurchaseOrder: async (data: {
    branch_id: number
    vendor_id: number
    tanggal_dibutuhkan?: string
    catatan?: string
    items: PurchaseOrderItem[]
  }) => {
    const res = await purchaseApi.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data)
    return res.data.data
  },

  updatePOItems: async (id: number, items: PurchaseOrderItem[]) => {
    const res = await purchaseApi.put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/items`, {
      items,
    })
    return res.data.data
  },

  submitPO: async (id: number) => {
    const res = await purchaseApi.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/submit`)
    return res.data.data
  },

  approvePO: async (id: number) => {
    const res = await purchaseApi.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/approve`)
    return res.data.data
  },

  rejectPO: async (id: number, rejection_reason: string) => {
    const res = await purchaseApi.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/reject`, {
      rejection_reason,
    })
    return res.data.data
  },

  receivePO: async (id: number, tanggal_pengiriman?: string) => {
    const res = await purchaseApi.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/receive`, {
      tanggal_pengiriman,
    })
    return res.data.data
  },

  cancelPO: async (id: number) => {
    const res = await purchaseApi.patch<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/cancel`)
    return res.data.data
  },

  getBranches: async () => {
    const res = await purchaseApi.get<ApiResponse<{ id: number; name: string; code: string }[]>>(
      '/branches'
    )
    return res.data.data
  },
}
