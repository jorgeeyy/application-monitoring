import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const nav = [
    { to: '/', label: 'Websites', icon: '🌐' },
    { to: '/websites/new', label: 'Add Website', icon: '➕' },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">App Monitor</h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              location.pathname === to
                ? 'bg-slate-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-sm text-slate-400 truncate">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
