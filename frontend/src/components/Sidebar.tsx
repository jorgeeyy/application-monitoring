import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Globe,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  Bell,
  Users,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
} from 'lucide-react'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/websites', label: 'Monitors', icon: Globe },
  { to: '/ssl', label: 'SSL', icon: Shield },
]

const monitorNav = [
  { to: '#', label: 'Incidents', icon: AlertTriangle, disabled: true },
  { to: '#', label: 'Status Pages', icon: FileText, disabled: true },
  { to: '#', label: 'Uptime', icon: Clock, disabled: true },
  { to: '#', label: 'Response Times', icon: Activity, disabled: true },
  { to: '#', label: 'Alert Rules', icon: Bell, disabled: true },
]

const accountNav = [
  { to: '#', label: 'Team', icon: Users, disabled: true },
  { to: '#', label: 'Billing', icon: CreditCard, disabled: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (to: string) => {
    if (to === '#') return false
    return location.pathname === to || (to === '/websites' && location.pathname.startsWith('/websites'))
  }

  const renderNavItem = ({ to, label, icon: Icon, disabled }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }) => {
    const active = isActive(to)
    if (disabled) {
      return (
        <div
          key={label}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-sidebar-foreground/20 cursor-not-allowed select-none"
        >
          <Icon className="w-4 h-4 shrink-0 opacity-30" />
          <span className="opacity-30">{label}</span>
        </div>
      )
    }
    return (
      <Link
        key={to}
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          active
            ? 'bg-linear-to-r from-accent/20 to-accent/5 text-accent border-l-2 border-accent ml-0'
            : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/80 hover:translate-x-0.5'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          active ? 'bg-accent/15' : 'bg-transparent group-hover:bg-white/5'
        }`}>
          <Icon className={`w-4 h-4 ${active ? 'text-accent' : ''}`} />
        </div>
        {label}
        {active && (
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        )}
      </Link>
    )
  }

  return (
    <aside className="w-60 h-full flex flex-col bg-linear-to-b from-sidebar to-[#060a13] border-r border-white/4 select-none shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-white/4">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent via-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-accent/30">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-foreground tracking-tight leading-tight">AppMonitor</span>
          <span className="text-[10px] text-muted-foreground/50 font-semibold tracking-[0.12em] uppercase">Enterprise SRE</span>
        </div>
      </div>

      <div className="p-3 pt-4">
        <Link
          to="/websites/new"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-linear-to-r from-accent to-blue-600 text-white hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span className="text-base leading-none font-light">+</span>
          New Monitor
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        <div className="mb-2">
          {mainNav.map(renderNavItem)}
        </div>

        <div className="pt-3 pb-1">
          <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.18em]">Monitor</p>
          {monitorNav.map(renderNavItem)}
        </div>

        <div className="pt-3 pb-1">
          <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.18em]">Account</p>
          {accountNav.map(renderNavItem)}
        </div>
      </nav>

      <div className="px-3 pb-2">
        <Link
          to="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/80 transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          Support
        </Link>
      </div>

      <div className="mx-3 mb-3 p-3 rounded-xl bg-linear-to-r from-white/2 to-transparent border border-white/4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-white/6">
            <span className="text-xs font-bold text-accent">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground/80 font-medium truncate leading-tight">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">Free Plan</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
