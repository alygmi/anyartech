import { ActiveBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, LoadingSpinner } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { purchaseService } from '@/services/purchaseService'
import { formatCurrency } from '@/lib/utils'
import type { Item, Vendor } from '@/types'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ItemListPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [form, setForm] = useState({
    code: '', name: '', description: '', category: '', unit: '', default_vendor_id: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadVendors()
  }, [])

  useEffect(() => {
    loadItems()
  }, [page, category])

  const loadVendors = async () => {
    const res = await purchaseService.getVendors({ per_page: 100, is_active: true })
    setVendors(res.data)
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: 15 }
      if (search) params.search = search
      if (category) params.category = category
      const res = await purchaseService.getItems(params)
      setItems(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadItems()
  }

  const openForm = (item?: Item) => {
    if (item) {
      setEditItem(item)
      setForm({
        code: item.code, name: item.name, description: item.description || '',
        category: item.category, unit: item.unit,
        default_vendor_id: item.default_vendor_id ? String(item.default_vendor_id) : '',
      })
    } else {
      setEditItem(null)
      setForm({ code: '', name: '', description: '', category: '', unit: '', default_vendor_id: '' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        default_vendor_id: form.default_vendor_id ? Number(form.default_vendor_id) : null,
      }
      if (editItem) {
        await purchaseService.updateItem(editItem.id, data)
      } else {
        await purchaseService.createItem(data)
      }
      setShowForm(false)
      loadItems()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Manajemen Item" action={<Button onClick={() => openForm()}><Plus size={16} /> Tambah Item</Button>} />

      <Card className="mb-4 p-4 flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input placeholder="Cari nama/kode..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button type="submit" variant="secondary"><Search size={16} /></Button>
        </form>
        <Input placeholder="Filter kategori..." value={category} onChange={(e) => setCategory(e.target.value)} className="w-48" />
      </Card>

      <Card>
        {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState /> : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kode</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Unit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Last Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.category}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{formatCurrency(item.last_price)}</td>
                    <td className="px-4 py-3"><ActiveBadge isActive={item.is_active} /></td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => openForm(item)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Edit Item' : 'Tambah Item'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          <Input label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select
            label="Default Vendor"
            options={vendors.map((v) => ({ value: v.id, label: v.name }))}
            value={form.default_vendor_id}
            onChange={(e) => setForm({ ...form, default_vendor_id: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
