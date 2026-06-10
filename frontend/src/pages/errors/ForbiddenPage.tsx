import { Button } from '@/components/ui/Button'
import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldX className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <Link to="/">
          <Button variant="secondary">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
