import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { purchaseService } from '@/services/purchaseService'
import { formatCurrency } from '@/lib/utils'
import type { Item, Vendor } from '@/types'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface POItemRow {
  item_id: string
  quantity: string
  unit_price: string
  notes: string
}

export function POCreatePage() {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<{ id: number; name: string; code: string }[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    branch_id: '',
    vendor_id: '',
    tanggal_dibutuhkan: '',
    catatan: '',
  })
  const [poItems, setPOItems] = useState<POItemRow[]>([
    { item_id: '', quantity: '1', unit_price: '0', notes: '' },
  ])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    const [branchRes, vendorRes, itemRes] = await Promise.all([
      purchaseService.getBranches(),
      purchaseService.getVendors({ per_page: 100, is_active: true }),
      purchaseService.getItems({ per_page: 100, is_active: true }),
    ])
    setBranches(branchRes)
    setVendors(vendorRes.data)
    setItems(itemRes.data)
  }

  const addItem = () => {
    setPOItems([...poItems, { item_id: '', quantity: '1', unit_price: '0', notes: '' }])
  }

  const removeItem = (index: number) => {
    setPOItems(poItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof POItemRow, value: string) => {
    const updated = [...poItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'item_id') {
      const selectedItem = items.find((i) => i.id === Number(value))
      if (selectedItem?.last_price) {
        updated[index].unit_price = String(selectedItem.last_price)
      }
    }

    setPOItems(updated)
  }

  const totalAmount = poItems.reduce((sum, row) => {
    return sum + Number(row.quantity || 0) * Number(row.unit_price || 0)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        branch_id: Number(form.branch_id),
        vendor_id: Number(form.vendor_id),
        tanggal_dibutuhkan: form.tanggal_dibutuhkan || undefined,
        catatan: form.catatan || undefined,
        items: poItems.map((row) => ({
          item_id: Number(row.item_id),
          quantity: Number(row.quantity),
          unit_price: Number(row.unit_price),
          notes: row.notes || undefined,
        })),
      }
      const po = await purchaseService.createPurchaseOrder(data)
      navigate(`/purchasing/purchase-orders/${po.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link to="/purchasing/purchase-orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Purchase Order Baru</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cabang"
              options={branches.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }))}
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              required
            />
            <Select
              label="Vendor"
              options={vendors.map((v) => ({ value: v.id, label: v.name }))}
              value={form.vendor_id}
              onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
              required
            />
            <Input
              label="Tanggal Dibutuhkan"
              type="date"
              value={form.tanggal_dibutuhkan}
              onChange={(e) => setForm({ ...form, tanggal_dibutuhkan: e.target.value })}
            />
            <Textarea
              label="Catatan"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              rows={2}
            />
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Item PO</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus size={16} /> Tambah Item
            </Button>
          </div>
          <div className="p-4 space-y-4">
            {poItems.map((row, index) => {
              const subtotal = Number(row.quantity || 0) * Number(row.unit_price || 0)
              return (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4">
                  <div className="col-span-4">
                    <Select
                      label={index === 0 ? 'Item' : undefined}
                      options={items.map((i) => ({ value: i.id, label: `${i.code} - ${i.name}` }))}
                      value={row.item_id}
                      onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Qty' : undefined}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Harga Satuan' : undefined}
                      type="number"
                      min="0"
                      value={row.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <p className={index === 0 ? 'text-sm font-medium text-gray-700 mb-1' : ''}>
                      {index === 0 ? 'Subtotal' : ''}
                    </p>
                    <p className="py-2 text-sm font-medium">{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {poItems.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-4 border-t flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/purchasing/purchase-orders">
            <Button type="button" variant="secondary">Batal</Button>
          </Link>
          <Button type="submit" loading={loading}>Simpan sebagai Draft</Button>
        </div>
      </form>
    </div>
  )
}
