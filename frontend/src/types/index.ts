export type UserRole =
  | 'superadmin'
  | 'admin_hrd'
  | 'admin_cabang'
  | 'karyawan'
  | 'admin_purchasing'
  | 'staff_purchasing'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  branch_id: number | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface Branch {
  id: number
  name: string
  code: string
  address?: string | null
  phone?: string | null
  parent_id?: number | null
  is_active: boolean
  children?: Branch[]
  created_at?: string
  updated_at?: string
}

export interface Position {
  id: number
  name: string
  code: string
  parent_id?: number | null
  is_active: boolean
  children?: Position[]
  created_at?: string
  updated_at?: string
}

export interface Employee {
  id: number
  nik: string
  name: string
  email: string
  phone?: string | null
  gender: 'male' | 'female'
  birth_date?: string | null
  address?: string | null
  branch_id: number
  position_id: number
  contract_type: 'permanent' | 'contract' | 'intern'
  join_date: string
  contract_end_date?: string | null
  is_active: boolean
  branch?: Branch
  position?: Position
  created_at?: string
  updated_at?: string
}

export interface Vendor {
  id: number
  name: string
  code: string
  contact_person: string
  phone: string
  email?: string | null
  address: string
  npwp?: string | null
  payment_term_days: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Item {
  id: number
  code: string
  name: string
  description?: string | null
  category: string
  unit: string
  default_vendor_id?: number | null
  last_price?: number | null
  is_active: boolean
  default_vendor?: Vendor
  created_at?: string
  updated_at?: string
}

export type POStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'received'
  | 'cancelled'

export interface PurchaseOrderItem {
  id?: number
  item_id: number
  item_name?: string
  quantity: number
  unit?: string
  unit_price: number
  subtotal?: number
  notes?: string | null
}

export interface PurchaseOrder {
  id: number
  po_number: string
  branch_id: number
  branch_name?: string
  branch_code?: string
  vendor_id: number
  requested_by: number
  status: POStatus
  tanggal_po: string
  tanggal_dibutuhkan?: string | null
  tanggal_pengiriman?: string | null
  total_amount: number
  catatan?: string | null
  rejection_reason?: string | null
  approved_by?: number | null
  approved_at?: string | null
  vendor?: Vendor
  items?: PurchaseOrderItem[]
  created_at?: string
  updated_at?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface DashboardStats {
  total_active_employees: number
  total_branches: number
  employees_by_division: { division: string; count: number }[]
}

export interface PurchasingDashboardStats {
  total_po_this_month: number
  pending_approval: number
  total_po_value: number
  po_by_status: { status: string; count: number }[]
}
