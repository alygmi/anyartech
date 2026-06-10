import { Card, PageHeader, StatCard } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Loading'
import { employeeService } from '@/services/employeeService'
import { formatDate } from '@/lib/utils'
import type { Employee } from '@/types'
import { Building2, Users, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function HRISDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [totalBranches, setTotalBranches] = useState(0)
  const [expiringContracts, setExpiringContracts] = useState<Employee[]>([])
  const [divisionBreakdown, setDivisionBreakdown] = useState<{ name: string; count: number }[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [employees, branches, expiring] = await Promise.all([
        employeeService.getEmployees({ per_page: 1, is_active: true }),
        employeeService.getActiveBranches(),
        employeeService.getExpiringContracts(30),
      ])

      setTotalEmployees(employees.total)
      setTotalBranches(branches.length)
      setExpiringContracts(expiring)

      const allEmployees = await employeeService.getEmployees({ per_page: 100, is_active: true })
      const divisionMap = new Map<string, number>()
      allEmployees.data.forEach((emp) => {
        const div = emp.position?.name || 'Lainnya'
        divisionMap.set(div, (divisionMap.get(div) || 0) + 1)
      })
      setDivisionBreakdown(
        Array.from(divisionMap.entries()).map(([name, count]) => ({ name, count }))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="Dashboard HRIS" description="Ringkasan data karyawan dan organisasi" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Karyawan Aktif"
          value={totalEmployees}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Total Cabang"
          value={totalBranches}
          icon={<Building2 size={20} />}
        />
        <StatCard
          title="Kontrak Berakhir (30 hari)"
          value={expiringContracts.length}
          icon={<AlertTriangle size={20} />}
          subtitle="Perlu perhatian"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Karyawan per Divisi</h2>
          </div>
          <div className="p-4">
            {divisionBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data</p>
            ) : (
              <div className="space-y-3">
                {divisionBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Kontrak Berakhir</h2>
            <Link to="/hris/employees" className="text-sm text-primary-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="divide-y">
            {expiringContracts.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Tidak ada kontrak yang akan berakhir</p>
            ) : (
              expiringContracts.slice(0, 5).map((emp) => (
                <Link
                  key={emp.id}
                  to={`/hris/employees/${emp.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.branch?.name}</p>
                  </div>
                  <span className="text-xs text-orange-600 font-medium">
                    {formatDate(emp.contract_end_date)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
