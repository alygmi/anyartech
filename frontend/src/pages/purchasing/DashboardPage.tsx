import { StatusBadge } from '@/components/ui/Badge'
import { Card, PageHeader, StatCard } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { purchaseService } from '@/services/purchaseService'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseOrder } from '@/types'
import { FileText, Clock, DollarSign, BarChart3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function PurchasingDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalPO, setTotalPO] = useState(0)
  const [pendingApproval, setPendingApproval] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [statusBreakdown, setStatusBreakdown] = useState<{ status: string; count: number }[]>([])
  const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      const [allPOs, submittedPOs, recent] = await Promise.all([
        purchaseService.getPurchaseOrders({ date_from: firstDay, date_to: lastDay, per_page: 100 }),
        purchaseService.getPurchaseOrders({ status: 'submitted', per_page: 1 }),
        purchaseService.getPurchaseOrders({ per_page: 5 }),
      ])

      setTotalPO(allPOs.total)
      setPendingApproval(submittedPOs.total)
      setTotalValue(allPOs.data.reduce((sum, po) => sum + Number(po.total_amount), 0))
      setRecentPOs(recent.data)

      const statusMap = new Map<string, number>()
      allPOs.data.forEach((po) => {
        statusMap.set(po.status, (statusMap.get(po.status) || 0) + 1)
      })
      setStatusBreakdown(
        Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Dashboard Purchasing" description="Ringkasan purchase order" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="PO Bulan Ini" value={totalPO} icon={<FileText size={20} />} />
        <StatCard title="Pending Approval" value={pendingApproval} icon={<Clock size={20} />} />
        <StatCard title="Total Nilai PO" value={formatCurrency(totalValue)} icon={<DollarSign size={20} />} />
        <StatCard title="Status Berbeda" value={statusBreakdown.length} icon={<BarChart3 size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">PO per Status</h2>
          </div>
          <div className="p-4 space-y-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data</p>
            ) : (
              statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">PO Terbaru</h2>
            <Link to="/purchasing/purchase-orders" className="text-sm text-primary-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y">
            {recentPOs.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Belum ada PO</p>
            ) : (
              recentPOs.map((po) => (
                <Link
                  key={po.id}
                  to={`/purchasing/purchase-orders/${po.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{po.po_number}</p>
                    <p className="text-xs text-gray-500">{po.vendor?.name || po.branch_name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={po.status} />
                    <p className="text-xs text-gray-500 mt-1">{formatDate(po.tanggal_po)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
