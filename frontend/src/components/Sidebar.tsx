import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Globe,
  Shield,
  LogOut,
} from 'lucide-react'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/websites', label: 'Monitors', icon: Globe },
  { to: '/ssl', label: 'SSL', icon: Shield },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (to: string) => {
    return location.pathname === to || (to === '/websites' && location.pathname.startsWith('/websites'))
  }

  return (
    <aside className="w-[220px] h-full flex flex-col bg-black border-r border-[#1a1a1a] select-none shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-[#1a1a1a]">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-black">A</span>
          </div>
          <span className="text-sm font-semibold text-foreground">AppMonitor</span>
        </Link>
      </div>

      <div className="p-3">
        <Link
          to="/websites/new"
          className="w-full flex items-center justify-center gap-2 h-8 rounded-md bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
        >
          <span className="text-sm leading-none">+</span>
          New Monitor
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {mainNav.map(({ to, label, icon: Icon }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                active
                  ? 'bg-[#111] text-foreground'
                  : 'text-[#666] hover:text-foreground hover:bg-[#0a0a0a]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#111] flex items-center justify-center">
            <span className="text-xs font-medium text-[#999]">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground truncate leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-[#555] hover:text-foreground hover:bg-[#111] transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
