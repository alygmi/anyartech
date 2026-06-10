import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { TreeView } from '@/components/ui/TreeView'
import { Modal } from '@/components/ui/Modal'
import { employeeService } from '@/services/employeeService'
import type { Branch } from '@/types'
import { Plus, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

export function BranchListPage() {
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '', parent_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBranches()
  }, [])

  const loadBranches = async () => {
    try {
      const data = await employeeService.getBranchTree()
      setBranches(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (branch?: Branch) => {
    if (branch) {
      setEditBranch(branch)
      setForm({
        name: branch.name,
        code: branch.code,
        address: branch.address || '',
        phone: branch.phone || '',
        parent_id: branch.parent_id ? String(branch.parent_id) : '',
      })
    } else {
      setEditBranch(null)
      setForm({ name: '', code: '', address: '', phone: '', parent_id: '' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
      }
      if (editBranch) {
        await employeeService.updateBranch(editBranch.id, data)
      } else {
        await employeeService.createBranch(data)
      }
      setShowForm(false)
      loadBranches()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const flatBranches = flattenTree(branches)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Manajemen Cabang"
        description="Kelola hierarki cabang perusahaan"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Tambah Cabang
          </Button>
        }
      />

      <Card className="p-4">
        <TreeView
          data={branches}
          actions={(node) => (
            <Button variant="ghost" size="sm" onClick={() => openForm(node as Branch)}>
              <Pencil size={14} />
            </Button>
          )}
        />
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editBranch ? 'Edit Cabang' : 'Tambah Cabang'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
          >
            <option value="">Tidak ada parent</option>
            {flatBranches
              .filter((b) => b.id !== editBranch?.id)
              .map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" loading={saving}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function flattenTree(nodes: Branch[]): Branch[] {
  const result: Branch[] = []
  const walk = (items: Branch[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children) walk(item.children)
    })
  }
  walk(nodes)
  return result
}
