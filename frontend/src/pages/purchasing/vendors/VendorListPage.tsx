import { ActiveBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, LoadingSpinner } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { purchaseService } from '@/services/purchaseService'
import type { Vendor } from '@/types'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function VendorListPage() {
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [form, setForm] = useState({
    name: '', code: '', contact_person: '', phone: '', email: '', address: '', npwp: '', payment_term_days: '30',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadVendors()
  }, [page, isActive])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: 15 }
      if (search) params.search = search
      if (isActive) params.is_active = isActive === '1'
      const res = await purchaseService.getVendors(params)
      setVendors(res.data)
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
    loadVendors()
  }

  const openForm = (vendor?: Vendor) => {
    if (vendor) {
      setEditVendor(vendor)
      setForm({
        name: vendor.name, code: vendor.code, contact_person: vendor.contact_person,
        phone: vendor.phone, email: vendor.email || '', address: vendor.address,
        npwp: vendor.npwp || '', payment_term_days: String(vendor.payment_term_days),
      })
    } else {
      setEditVendor(null)
      setForm({ name: '', code: '', contact_person: '', phone: '', email: '', address: '', npwp: '', payment_term_days: '30' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, payment_term_days: Number(form.payment_term_days) }
      if (editVendor) {
        await purchaseService.updateVendor(editVendor.id, data)
      } else {
        await purchaseService.createVendor(data)
      }
      setShowForm(false)
      loadVendors()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Vendor"
        action={<Button onClick={() => openForm()}><Plus size={16} /> Tambah Vendor</Button>}
      />

      <Card className="mb-4 p-4 flex gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input placeholder="Cari nama/kode..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button type="submit" variant="secondary"><Search size={16} /></Button>
        </form>
        <Select
          options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Nonaktif' }]}
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="w-32"
        />
      </Card>

      <Card>
        {loading ? <LoadingSpinner /> : vendors.length === 0 ? <EmptyState /> : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kode</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kontak</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{v.code}</td>
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.contact_person}</td>
                    <td className="px-4 py-3"><ActiveBadge isActive={v.is_active} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/purchasing/vendors/${v.id}`}><Button variant="ghost" size="sm">Detail</Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => openForm(v)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editVendor ? 'Edit Vendor' : 'Tambah Vendor'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            <Input label="Contact Person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} required />
            <Input label="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="NPWP" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} />
            <Input label="Payment Term (hari)" type="number" value={form.payment_term_days} onChange={(e) => setForm({ ...form, payment_term_days: e.target.value })} required />
          </div>
          <Input label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
