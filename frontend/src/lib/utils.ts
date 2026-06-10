import { clsx, type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!date) return '-'
  try {
    return format(parseISO(date), fmt, { locale: id })
  } catch {
    return date
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(Number(amount))) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null) return '-'
  return new Intl.NumberFormat('id-ID').format(num)
}
