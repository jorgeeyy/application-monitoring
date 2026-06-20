import { Link, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Globe,
  Shield,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/websites', label: 'Monitors', icon: Globe },
  { to: '/ssl', label: 'SSL', icon: Shield },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isActive = (to: string) => {
    return location.pathname === to || (to === '/websites' && location.pathname.startsWith('/websites'))
  }

  return (
    <aside className="w-[220px] h-full flex flex-col bg-background border-r border-border select-none shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-sm font-semibold text-foreground">AppMonitor</span>
        </Link>
      </div>

      <div className="p-3">
        <Link
          to="/websites/new"
          className="w-full flex items-center justify-center gap-2 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
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
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-foreground truncate leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {mounted && theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
