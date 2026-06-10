import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { HRISDashboardPage } from '@/pages/hris/DashboardPage'
import { BranchListPage } from '@/pages/hris/branches/BranchListPage'
import { EmployeeDetailPage } from '@/pages/hris/employees/EmployeeDetailPage'
import { EmployeeListPage } from '@/pages/hris/employees/EmployeeListPage'
import { PositionListPage } from '@/pages/hris/positions/PositionListPage'
import { UserListPage } from '@/pages/hris/users/UserListPage'
import { PurchasingDashboardPage } from '@/pages/purchasing/DashboardPage'
import { ItemListPage } from '@/pages/purchasing/items/ItemListPage'
import { POCreatePage } from '@/pages/purchasing/purchase-orders/POCreatePage'
import { PODetailPage } from '@/pages/purchasing/purchase-orders/PODetailPage'
import { POListPage } from '@/pages/purchasing/purchase-orders/POListPage'
import { VendorDetailPage } from '@/pages/purchasing/vendors/VendorDetailPage'
import { VendorListPage } from '@/pages/purchasing/vendors/VendorListPage'
import { useAuthStore } from '@/store/authStore'
import { Navigate, Route, Routes } from 'react-router-dom'

function HomeRedirect() {
  const { canAccessHRIS, canAccessPurchasing } = useAuthStore()
  if (canAccessHRIS()) return <Navigate to="/hris" replace />
  if (canAccessPurchasing()) return <Navigate to="/purchasing" replace />
  return <Navigate to="/forbidden" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          {/* HRIS Module */}
          <Route element={<ProtectedRoute module="hris" />}>
            <Route path="hris" element={<HRISDashboardPage />} />
            <Route path="hris/employees" element={<EmployeeListPage />} />
            <Route path="hris/employees/:id" element={<EmployeeDetailPage />} />
            <Route element={<ProtectedRoute roles={['superadmin', 'admin_hrd']} />}>
              <Route path="hris/branches" element={<BranchListPage />} />
              <Route path="hris/positions" element={<PositionListPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['superadmin']} />}>
              <Route path="hris/users" element={<UserListPage />} />
            </Route>
          </Route>

          {/* Purchasing Module */}
          <Route element={<ProtectedRoute module="purchasing" />}>
            <Route path="purchasing" element={<PurchasingDashboardPage />} />
            <Route path="purchasing/vendors" element={<VendorListPage />} />
            <Route path="purchasing/vendors/:id" element={<VendorDetailPage />} />
            <Route path="purchasing/items" element={<ItemListPage />} />
            <Route path="purchasing/purchase-orders" element={<POListPage />} />
            <Route path="purchasing/purchase-orders/new" element={<POCreatePage />} />
            <Route path="purchasing/purchase-orders/:id" element={<PODetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
