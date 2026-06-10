import { useAuthStore } from '@/store/authStore'
import { Navigate, Outlet } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/Loading'

interface ProtectedRouteProps {
  roles?: string[]
  module?: 'hris' | 'purchasing'
}

export function ProtectedRoute({ roles, module }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, canAccessHRIS, canAccessPurchasing } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (module === 'hris' && !canAccessHRIS()) {
    return <Navigate to="/forbidden" replace />
  }

  if (module === 'purchasing' && !canAccessPurchasing()) {
    return <Navigate to="/forbidden" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
