import { StatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { purchaseService } from '@/services/purchaseService'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseOrder, Vendor } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [history, setHistory] = useState<PurchaseOrder[]>([])

  useEffect(() => {
    if (id) loadData(Number(id))
  }, [id])

  const loadData = async (vendorId: number) => {
    try {
      const [v, h] = await Promise.all([
        purchaseService.getVendor(vendorId),
        purchaseService.getVendorPurchaseHistory(vendorId, { per_page: 20 }),
      ])
      setVendor(v)
      setHistory(h.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!vendor) return <p>Vendor tidak ditemukan</p>

  return (
    <div>
      <Link to="/purchasing/vendors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{vendor.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-4 border-b"><h2 className="font-semibold">Informasi Vendor</h2></div>
          <div className="p-4 space-y-3">
            <InfoRow label="Kode" value={vendor.code} />
            <InfoRow label="Contact Person" value={vendor.contact_person} />
            <InfoRow label="Telepon" value={vendor.phone} />
            <InfoRow label="Email" value={vendor.email} />
            <InfoRow label="Alamat" value={vendor.address} />
            <InfoRow label="NPWP" value={vendor.npwp} />
            <InfoRow label="Payment Term" value={`${vendor.payment_term_days} hari`} />
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b"><h2 className="font-semibold">Riwayat PO</h2></div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Belum ada PO</p>
            ) : (
              history.map((po) => (
                <Link key={po.id} to={`/purchasing/purchase-orders/${po.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{po.po_number}</p>
                    <p className="text-xs text-gray-500">{formatDate(po.tanggal_po)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={po.status} />
                    <p className="text-xs text-gray-500 mt-1">{formatCurrency(po.total_amount)}</p>
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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value || '-'}</span>
    </div>
  )
}
