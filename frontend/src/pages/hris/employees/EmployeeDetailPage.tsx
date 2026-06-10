import { ActiveBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { TreeView } from '@/components/ui/TreeView'
import { employeeService } from '@/services/employeeService'
import { formatDate } from '@/lib/utils'
import type { Employee, Position } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [positionTree, setPositionTree] = useState<Position[]>([])

  useEffect(() => {
    if (id) loadData(Number(id))
  }, [id])

  const loadData = async (employeeId: number) => {
    try {
      const [emp, tree] = await Promise.all([
        employeeService.getEmployee(employeeId),
        employeeService.getPositionTree(),
      ])
      setEmployee(emp)
      setPositionTree(tree)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!employee) return <p>Karyawan tidak ditemukan</p>

  return (
    <div>
      <div className="mb-6">
        <Link to="/hris/employees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-500">{employee.nik}</p>
          </div>
          <ActiveBadge isActive={employee.is_active} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Informasi Pribadi</h2>
          </div>
          <div className="p-4 space-y-3">
            <InfoRow label="Email" value={employee.email} />
            <InfoRow label="Telepon" value={employee.phone} />
            <InfoRow label="Jenis Kelamin" value={employee.gender === 'male' ? 'Laki-laki' : 'Perempuan'} />
            <InfoRow label="Tanggal Lahir" value={formatDate(employee.birth_date)} />
            <InfoRow label="Alamat" value={employee.address} />
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Informasi Kepegawaian</h2>
          </div>
          <div className="p-4 space-y-3">
            <InfoRow label="Cabang" value={employee.branch?.name} />
            <InfoRow label="Jabatan" value={employee.position?.name} />
            <InfoRow label="Tipe Kontrak" value={employee.contract_type} className="capitalize" />
            <InfoRow label="Tanggal Bergabung" value={formatDate(employee.join_date)} />
            <InfoRow label="Berakhir Kontrak" value={formatDate(employee.contract_end_date)} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Hierarki Jabatan</h2>
          </div>
          <div className="p-4">
            <TreeView
              data={positionTree}
              selectedId={employee.position_id}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${className || ''}`}>{value || '-'}</span>
    </div>
  )
}
