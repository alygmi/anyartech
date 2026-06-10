import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Loading'
import { TreeView } from '@/components/ui/TreeView'
import { Modal } from '@/components/ui/Modal'
import { employeeService } from '@/services/employeeService'
import type { Position } from '@/types'
import { Plus, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PositionListPage() {
  const [loading, setLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editPosition, setEditPosition] = useState<Position | null>(null)
  const [form, setForm] = useState({ name: '', code: '', parent_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPositions()
  }, [])

  const loadPositions = async () => {
    try {
      const data = await employeeService.getPositionTree()
      setPositions(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (position?: Position) => {
    if (position) {
      setEditPosition(position)
      setForm({
        name: position.name,
        code: position.code,
        parent_id: position.parent_id ? String(position.parent_id) : '',
      })
    } else {
      setEditPosition(null)
      setForm({ name: '', code: '', parent_id: '' })
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
      if (editPosition) {
        await employeeService.updatePosition(editPosition.id, data)
      } else {
        await employeeService.createPosition(data)
      }
      setShowForm(false)
      loadPositions()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const flatPositions = flattenTree(positions)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Manajemen Jabatan"
        description="Kelola hierarki jabatan perusahaan"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Tambah Jabatan
          </Button>
        }
      />

      <Card className="p-4">
        <TreeView
          data={positions}
          actions={(node) => (
            <Button variant="ghost" size="sm" onClick={() => openForm(node as Position)}>
              <Pencil size={14} />
            </Button>
          )}
        />
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editPosition ? 'Edit Jabatan' : 'Tambah Jabatan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <select
            className="w-full px-3 py-2 border rounded-lg text-sm"
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
          >
            <option value="">Tidak ada atasan</option>
            {flatPositions
              .filter((p) => p.id !== editPosition?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
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

function flattenTree(nodes: Position[]): Position[] {
  const result: Position[] = []
  const walk = (items: Position[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children) walk(item.children)
    })
  }
  walk(nodes)
  return result
}
