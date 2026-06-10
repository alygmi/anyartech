import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { purchaseService } from '@/services/purchaseService'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PurchaseOrder } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export function PODetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [po, setPO] = useState<PurchaseOrder | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (id) loadPO(Number(id))
  }, [id])

  const loadPO = async (poId: number) => {
    try {
      const data = await purchaseService.getPurchaseOrder(poId)
      setPO(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    if (!po) return
    setActionLoading(true)
    try {
      switch (action) {
        case 'submit':
          await purchaseService.submitPO(po.id)
          break
        case 'approve':
          await purchaseService.approvePO(po.id)
          break
        case 'reject':
          await purchaseService.rejectPO(po.id, rejectionReason)
          setShowRejectModal(false)
          break
        case 'receive':
          await purchaseService.receivePO(po.id)
          break
        case 'cancel':
          await purchaseService.cancelPO(po.id)
          break
      }
      loadPO(po.id)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const canSubmit = () => po?.status === 'draft'
  const canApprove = () => po?.status === 'submitted' && user && ['admin_purchasing', 'superadmin'].includes(user.role)
  const canReject = () => po?.status === 'submitted' && user && ['admin_purchasing', 'superadmin'].includes(user.role)
  const canReceive = () => {
    if (po?.status !== 'approved' || !user) return false
    if (['admin_purchasing', 'superadmin'].includes(user.role)) return true
    if (['admin_cabang', 'staff_purchasing'].includes(user.role)) {
      return user.branch_id === po.branch_id
    }
    return false
  }
  const canCancel = () => {
    if (!po || !user) return false
    if (po.status === 'draft') return true
    if (po.status === 'submitted') {
      if (['admin_purchasing', 'superadmin'].includes(user.role)) return true
      return po.requested_by === user.id
    }
    return false
  }

  if (loading) return <LoadingSpinner />
  if (!po) return <p>PO tidak ditemukan</p>

  return (
    <div>
      <Link to="/purchasing/purchase-orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{po.po_number}</h1>
          <p className="text-gray-500">{po.vendor?.name}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <div className="p-4 border-b"><h2 className="font-semibold">Informasi PO</h2></div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <InfoRow label="Cabang" value={po.branch_name} />
            <InfoRow label="Tanggal PO" value={formatDate(po.tanggal_po)} />
            <InfoRow label="Tanggal Dibutuhkan" value={formatDate(po.tanggal_dibutuhkan)} />
            <InfoRow label="Tanggal Pengiriman" value={formatDate(po.tanggal_pengiriman)} />
            <InfoRow label="Total Amount" value={formatCurrency(po.total_amount)} />
            {po.catatan && <InfoRow label="Catatan" value={po.catatan} className="col-span-2" />}
            {po.rejection_reason && (
              <div className="col-span-2 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600"><strong>Alasan ditolak:</strong> {po.rejection_reason}</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b"><h2 className="font-semibold">Aksi</h2></div>
          <div className="p-4 space-y-2">
            {canSubmit() && (
              <Button className="w-full" onClick={() => handleAction('submit')} loading={actionLoading}>
                Submit
              </Button>
            )}
            {canApprove() && (
              <Button className="w-full" variant="success" onClick={() => handleAction('approve')} loading={actionLoading}>
                Approve
              </Button>
            )}
            {canReject() && (
              <Button className="w-full" variant="danger" onClick={() => setShowRejectModal(true)}>
                Reject
              </Button>
            )}
            {canReceive() && (
              <Button className="w-full" variant="success" onClick={() => handleAction('receive')} loading={actionLoading}>
                Receive
              </Button>
            )}
            {canCancel() && (
              <Button className="w-full" variant="secondary" onClick={() => handleAction('cancel')} loading={actionLoading}>
                Cancel
              </Button>
            )}
            {!canSubmit() && !canApprove() && !canReject() && !canReceive() && !canCancel() && (
              <p className="text-sm text-gray-500">Tidak ada aksi tersedia</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b"><h2 className="font-semibold">Item PO</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Harga Satuan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {po.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3">{item.item_name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className="px-4 py-3">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right font-medium">Total</td>
              <td className="px-4 py-3 font-bold">{formatCurrency(po.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Tolak PO">
        <div className="space-y-4">
          <Textarea
            label="Alasan Penolakan"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Batal</Button>
            <Button
              variant="danger"
              onClick={() => handleAction('reject')}
              loading={actionLoading}
              disabled={rejectionReason.length < 5}
            >
              Tolak PO
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}
