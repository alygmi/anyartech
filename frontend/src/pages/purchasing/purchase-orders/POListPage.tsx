import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, LoadingSpinner } from '@/components/ui/Loading'
import { Pagination } from '@/components/ui/Pagination'
import { purchaseService } from '@/services/purchaseService'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseOrder } from '@/types'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function POListPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '' })

  useEffect(() => {
    loadOrders()
  }, [page, filters.status])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: 15 }
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const res = await purchaseService.getPurchaseOrders(params)
      setOrders(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Purchase Order"
        action={
          <Link to="/purchasing/purchase-orders/new">
            <Button><Plus size={16} /> Buat PO Baru</Button>
          </Link>
        }
      />

      <Card className="mb-4 p-4 flex flex-wrap gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-40"
        />
        <Input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} />
        <Input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} />
        <Button variant="secondary" onClick={() => { setPage(1); loadOrders() }}>Filter</Button>
      </Card>

      <Card>
        {loading ? <LoadingSpinner /> : orders.length === 0 ? <EmptyState /> : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">No. PO</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cabang</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{po.po_number}</td>
                    <td className="px-4 py-3">{po.branch_name}</td>
                    <td className="px-4 py-3">{po.vendor?.name || '-'}</td>
                    <td className="px-4 py-3">{formatDate(po.tanggal_po)}</td>
                    <td className="px-4 py-3">{formatCurrency(po.total_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/purchasing/purchase-orders/${po.id}`}>
                        <Button variant="ghost" size="sm">Detail</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  )
}
