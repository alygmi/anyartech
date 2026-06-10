import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  Building2,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Users,
  UserCog,
  GitBranch,
  Briefcase,
  Truck,
  Box,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles?: string[]
}

interface NavGroup {
  label: string
  icon: React.ReactNode
  module: 'hris' | 'purchasing'
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'HRIS',
    icon: <Users size={18} />,
    module: 'hris',
    items: [
      { label: 'Dashboard', to: '/hris', icon: <LayoutDashboard size={16} /> },
      { label: 'Karyawan', to: '/hris/employees', icon: <Users size={16} /> },
      {
        label: 'Cabang',
        to: '/hris/branches',
        icon: <Building2 size={16} />,
        roles: ['superadmin', 'admin_hrd'],
      },
      {
        label: 'Jabatan',
        to: '/hris/positions',
        icon: <Briefcase size={16} />,
        roles: ['superadmin', 'admin_hrd'],
      },
      {
        label: 'User',
        to: '/hris/users',
        icon: <UserCog size={16} />,
        roles: ['superadmin'],
      },
    ],
  },
  {
    label: 'Purchasing',
    icon: <ShoppingCart size={18} />,
    module: 'purchasing',
    items: [
      { label: 'Dashboard', to: '/purchasing', icon: <LayoutDashboard size={16} /> },
      { label: 'Vendor', to: '/purchasing/vendors', icon: <Truck size={16} /> },
      { label: 'Item', to: '/purchasing/items', icon: <Box size={16} /> },
      { label: 'Purchase Order', to: '/purchasing/purchase-orders', icon: <FileText size={16} /> },
    ],
  },
]

export function Sidebar() {
  const { user, canAccessHRIS, canAccessPurchasing } = useAuthStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    HRIS: true,
    Purchasing: true,
  })

  const visibleGroups = navGroups.filter((group) => {
    if (group.module === 'hris') return canAccessHRIS()
    if (group.module === 'purchasing') return canAccessPurchasing()
    return false
  })

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <GitBranch className="text-primary-400" size={24} />
          <span className="font-bold text-lg">Anyartech</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <button
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [group.label]: !prev[group.label] }))
              }
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-gray-800"
            >
              {group.icon}
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown
                size={16}
                className={cn('transition-transform', expanded[group.label] && 'rotate-180')}
              />
            </button>

            {expanded[group.label] && (
              <div className="ml-2 mt-1 space-y-0.5">
                {group.items
                  .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/hris' || item.to === '/purchasing'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        )
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
