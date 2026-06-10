import { cn } from '@/lib/utils'
import { PO_STATUS_COLORS, PO_STATUS_LABELS } from '@/config/api'

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
        PO_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {PO_STATUS_LABELS[status] || status}
    </span>
  )
}

interface ActiveBadgeProps {
  isActive: boolean
}

export function ActiveBadge({ isActive }: ActiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      )}
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}
