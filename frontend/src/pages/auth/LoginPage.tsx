import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { GitBranch } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

export function LoginPage() {
  const { login, isAuthenticated, canAccessHRIS, canAccessPurchasing } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    if (canAccessHRIS()) return <Navigate to="/hris" replace />
    if (canAccessPurchasing()) return <Navigate to="/purchasing" replace />
    return <Navigate to="/forbidden" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login gagal. Periksa email dan password.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <GitBranch className="text-primary-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">Anyartech</span>
          </div>
          <p className="text-gray-500">HRIS & Purchasing System</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Masuk ke akun Anda</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
