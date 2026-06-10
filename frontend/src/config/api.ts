export const API_CONFIG = {
  auth: import.meta.env.VITE_AUTH_API || 'http://localhost:8001/api',
  employee: import.meta.env.VITE_EMPLOYEE_API || 'http://localhost:8002/api',
  purchase: import.meta.env.VITE_PURCHASE_API || 'http://localhost:8003/api',
}

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN_HRD: 'admin_hrd',
  ADMIN_CABANG: 'admin_cabang',
  KARYAWAN: 'karyawan',
  ADMIN_PURCHASING: 'admin_purchasing',
  STAFF_PURCHASING: 'staff_purchasing',
} as const

export const HRIS_ROLES: string[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_HRD,
  ROLES.ADMIN_CABANG,
  ROLES.KARYAWAN,
]

export const PURCHASING_ROLES: string[] = [
  ROLES.SUPERADMIN,
  ROLES.ADMIN_PURCHASING,
  ROLES.STAFF_PURCHASING,
  ROLES.ADMIN_CABANG,
]

export const PO_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  received: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-gray-800 text-gray-100',
}

export const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  received: 'Received',
  cancelled: 'Cancelled',
}
