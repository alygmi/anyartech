import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { employeeService } from '@/services/employeeService'
import type { Branch, Employee, Position } from '@/types'
import { useEffect, useState } from 'react'

interface EmployeeFormModalProps {
  isOpen: boolean
  onClose: () => void
  employee?: Employee | null
  onSuccess: () => void
}

export function EmployeeFormModal({ isOpen, onClose, employee, onSuccess }: EmployeeFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState<Branch[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [form, setForm] = useState({
    nik: '',
    name: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female',
    birth_date: '',
    address: '',
    branch_id: '',
    position_id: '',
    contract_type: 'permanent' as 'permanent' | 'contract' | 'intern',
    join_date: '',
    contract_end_date: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadOptions()
      if (employee) {
        setForm({
          nik: employee.nik,
          name: employee.name,
          email: employee.email,
          phone: employee.phone || '',
          gender: employee.gender,
          birth_date: employee.birth_date || '',
          address: employee.address || '',
          branch_id: String(employee.branch_id),
          position_id: String(employee.position_id),
          contract_type: employee.contract_type,
          join_date: employee.join_date,
          contract_end_date: employee.contract_end_date || '',
        })
      } else {
        setForm({
          nik: '', name: '', email: '', phone: '', gender: 'male',
          birth_date: '', address: '', branch_id: '', position_id: '',
          contract_type: 'permanent', join_date: '', contract_end_date: '',
        })
      }
    }
  }, [isOpen, employee])

  const loadOptions = async () => {
    const [branchRes, positionRes] = await Promise.all([
      employeeService.getBranches({ per_page: 100, is_active: true }),
      employeeService.getPositions({ per_page: 100, is_active: true }),
    ])
    setBranches(branchRes.data)
    setPositions(positionRes.data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = {
        ...form,
        branch_id: Number(form.branch_id),
        position_id: Number(form.position_id),
        contract_end_date: form.contract_end_date || null,
        birth_date: form.birth_date || null,
        phone: form.phone || null,
        address: form.address || null,
      }

      if (employee) {
        await employeeService.updateEmployee(employee.id, data)
      } else {
        await employeeService.createEmployee(data)
      }
      onSuccess()
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal menyimpan data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Karyawan' : 'Tambah Karyawan'}
      size="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="NIK" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} required />
          <Input label="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select
            label="Jenis Kelamin"
            options={[
              { value: 'male', label: 'Laki-laki' },
              { value: 'female', label: 'Perempuan' },
            ]}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
          />
          <Input label="Tanggal Lahir" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          <Select
            label="Cabang"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            required
          />
          <Select
            label="Jabatan"
            options={positions.map((p) => ({ value: p.id, label: p.name }))}
            value={form.position_id}
            onChange={(e) => setForm({ ...form, position_id: e.target.value })}
            required
          />
          <Select
            label="Tipe Kontrak"
            options={[
              { value: 'permanent', label: 'Permanent' },
              { value: 'contract', label: 'Kontrak' },
              { value: 'intern', label: 'Magang' },
            ]}
            value={form.contract_type}
            onChange={(e) => setForm({ ...form, contract_type: e.target.value as typeof form.contract_type })}
          />
          <Input label="Tanggal Bergabung" type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} required />
          {form.contract_type === 'contract' && (
            <Input label="Tanggal Berakhir Kontrak" type="date" value={form.contract_end_date} onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })} />
          )}
        </div>
        <Textarea label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  )
}
