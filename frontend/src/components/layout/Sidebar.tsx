import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Pill, PackageSearch, ShoppingCart, Receipt,
  Users, BarChart3, Bell, Truck, Settings, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/medicines', label: 'Medicines', icon: Pill },
      { to: '/inventory', label: 'Inventory', icon: PackageSearch },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/pos', label: 'Sales / POS', icon: ShoppingCart },
      { to: '/transactions', label: 'Transactions', icon: Receipt },
      { to: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/alerts', label: 'Alerts', icon: Bell },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/suppliers', label: 'Suppliers', icon: Truck },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-surface-dark-alt md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">MEDIX</p>
          <p className="text-[11px] text-slate-400">Pharmacy Ops Center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {sections.map(section => (
          <div key={section.label}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          All systems operational
        </div>
      </div>
    </aside>
  )
}
