import { ActiveBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, LoadingSpinner } from '@/components/ui/Loading'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { authService } from '@/services/authService'
import { employeeService } from '@/services/employeeService'
import type { Branch, User, UserRole } from '@/types'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

const ROLES = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin_hrd', label: 'Admin HRD' },
  { value: 'admin_cabang', label: 'Admin Cabang' },
  { value: 'karyawan', label: 'Karyawan' },
  { value: 'admin_purchasing', label: 'Admin Purchasing' },
  { value: 'staff_purchasing', label: 'Staff Purchasing' },
]

export function UserListPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', branch_id: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBranches()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadBranches = async () => {
    const res = await employeeService.getBranches({ per_page: 100 })
    setBranches(res.data)
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await authService.getUsers({ page, per_page: 15 })
      setUsers(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (user?: User) => {
    if (user) {
      setEditUser(user)
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        branch_id: user.branch_id ? String(user.branch_id) : '',
      })
    } else {
      setEditUser(null)
      setForm({ name: '', email: '', password: '', role: '', branch_id: '' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name: form.name,
        email: form.email,
        role: form.role as UserRole,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
        ...(form.password && { password: form.password }),
      }
      if (editUser) {
        await authService.updateUser(editUser.id, data)
      } else {
        await authService.createUser({ ...data, password: form.password })
      }
      setShowForm(false)
      loadUsers()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    await authService.toggleUserActive(user.id)
    loadUsers()
  }

  return (
    <div>
      <PageHeader
        title="Manajemen User"
        description="Kelola akun pengguna sistem"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Tambah User
          </Button>
        }
      />

      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <ActiveBadge isActive={user.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openForm(user)}>Edit</Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editUser ? 'Edit User' : 'Tambah User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input
            label={editUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editUser}
          />
          <Select
            label="Role"
            options={ROLES}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          />
          <Select
            label="Cabang"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
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
