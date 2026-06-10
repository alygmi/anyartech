import { ActiveBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, PageHeader } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { EmptyState, LoadingSpinner } from '@/components/ui/Loading'
import { Pagination } from '@/components/ui/Pagination'
import { employeeService } from '@/services/employeeService'
import type { Branch, Employee, Position } from '@/types'
import { Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmployeeFormModal } from './EmployeeFormModal'

export function EmployeeListPage() {
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    branch_id: '',
    position_id: '',
    contract_type: '',
    is_active: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadFilters()
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [page, filters])

  const loadFilters = async () => {
    const [branchRes, positionRes] = await Promise.all([
      employeeService.getBranches({ per_page: 100 }),
      employeeService.getPositions({ per_page: 100 }),
    ])
    setBranches(branchRes.data)
    setPositions(positionRes.data)
  }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, per_page: 15 }
      if (search) params.search = search
      if (filters.branch_id) params.branch_id = filters.branch_id
      if (filters.position_id) params.position_id = filters.position_id
      if (filters.contract_type) params.contract_type = filters.contract_type
      if (filters.is_active) params.is_active = filters.is_active === '1'

      const res = await employeeService.getEmployees(params)
      setEmployees(res.data)
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
    loadEmployees()
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditEmployee(null)
    loadEmployees()
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Karyawan"
        description="Kelola data karyawan perusahaan"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Tambah Karyawan
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="p-4 flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Cari nama/NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="secondary">
              <Search size={16} />
            </Button>
          </form>
          <Select
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            value={filters.branch_id}
            onChange={(e) => setFilters({ ...filters, branch_id: e.target.value })}
            className="w-40"
          />
          <Select
            options={positions.map((p) => ({ value: p.id, label: p.name }))}
            value={filters.position_id}
            onChange={(e) => setFilters({ ...filters, position_id: e.target.value })}
            className="w-40"
          />
          <Select
            options={[
              { value: 'permanent', label: 'Permanent' },
              { value: 'contract', label: 'Kontrak' },
              { value: 'intern', label: 'Magang' },
            ]}
            value={filters.contract_type}
            onChange={(e) => setFilters({ ...filters, contract_type: e.target.value })}
            className="w-36"
          />
          <Select
            options={[
              { value: '1', label: 'Aktif' },
              { value: '0', label: 'Nonaktif' },
            ]}
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
            className="w-32"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : employees.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">NIK</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cabang</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Jabatan</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Kontrak</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{emp.nik}</td>
                      <td className="px-4 py-3 font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.branch?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.position?.name || '-'}</td>
                      <td className="px-4 py-3 capitalize">{emp.contract_type}</td>
                      <td className="px-4 py-3">
                        <ActiveBadge isActive={emp.is_active} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/hris/employees/${emp.id}`}>
                            <Button variant="ghost" size="sm">Detail</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditEmployee(emp)
                              setShowForm(true)
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <EmployeeFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditEmployee(null)
        }}
        employee={editEmployee}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
