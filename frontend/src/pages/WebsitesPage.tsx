import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchWebsites } from '../api/websites'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Globe,
  ArrowRight,
  Search,
  Shield,
  Filter,
  MoreHorizontal,
} from 'lucide-react'

function getStatusBadge(isUp: boolean | null | undefined) {
  if (isUp === true) return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Up', dot: 'bg-green-400' }
  if (isUp === false) return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Down', dot: 'bg-red-400' }
  return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', label: 'Not checked', dot: 'bg-muted-foreground/30' }
}

function getStatusDot(isUp: boolean | null | undefined) {
  if (isUp === true) return 'bg-green-400'
  if (isUp === false) return 'bg-red-400'
  return 'bg-muted-foreground/30'
}

function getResponseTimeColor(ms: number | null | undefined) {
  if (ms == null) return 'text-muted-foreground'
  if (ms < 200) return 'text-green-400'
  if (ms < 500) return 'text-yellow-400'
  return 'text-red-400'
}

function getResponseTimeBg(ms: number | null | undefined) {
  if (ms == null) return 'bg-muted'
  if (ms < 200) return 'bg-green-500/10'
  if (ms < 500) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

export default function WebsitesPage() {
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
    refetchInterval: 30_000,
  })

  const [search, setSearch] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading monitors...</span>
        </div>
      </div>
    )
  }

  const filtered = websites?.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.url.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalUp = filtered.filter((w) => w.latest_check?.is_up === true).length
  const totalDown = filtered.filter((w) => w.latest_check?.is_up === false).length

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Monitors</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and track your service uptime.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl glass-card">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-medium text-foreground">{totalUp} Up</span>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl glass-card">
          <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
          <span className="text-xs font-medium text-foreground">{totalDown} Down</span>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl glass-card">
          <span className="text-xs font-medium text-muted-foreground">{filtered.length} Total</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search monitors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white/[0.03] border-white/5 focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-white/5 hover:bg-white/[0.03]">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/20">
              <Link to="/websites/new">+ Add Monitor</Link>
            </Button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-semibold">Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Response</th>
                  <th className="text-left px-6 py-3 font-semibold">Uptime</th>
                  <th className="text-left px-6 py-3 font-semibold">SSL</th>
                  <th className="text-right px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((w, index) => {
                  const last = w.latest_check
                  const badge = getStatusBadge(last?.is_up)
                  return (
                    <tr
                      key={w.id}
                      className="table-row animate-fade-in"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusDot(last?.is_up)} ${last?.is_up ? 'shadow-[0_0_6px_rgba(34,197,94,0.4)]' : last?.is_up === false ? 'shadow-[0_0_6px_rgba(239,68,68,0.4)]' : ''}`} />
                          <div>
                            <Link to={`/websites/${w.id}`} className="text-sm text-foreground hover:text-accent transition-colors font-medium">
                              {w.name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{w.url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge-modern inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.bg} ${badge.border} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-sm font-medium px-2.5 py-1 rounded-lg ${getResponseTimeBg(last?.response_time_ms)} ${getResponseTimeColor(last?.response_time_ms)}`}>
                          {last?.response_time_ms != null ? `${last.response_time_ms}ms` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {last?.is_up === true ? '100%' : last?.is_up === false ? '0%' : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {w.url.startsWith('http://') ? (
                          <span className="flex items-center gap-1.5 text-sm">
                            <Shield className="w-3.5 h-3.5 text-amber-400/60" />
                            <span className="text-muted-foreground">HTTP Only</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm">
                            <Shield className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-muted-foreground">Valid</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/websites/${w.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10"
                          >
                            Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Showing 1 to {filtered.length} of {filtered.length} monitors
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ) : search ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Search className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-base text-foreground font-semibold mb-1">No results found</p>
            <p className="text-sm text-muted-foreground">No monitors match "{search}"</p>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-blue-600/10 flex items-center justify-center mx-auto mb-4 border border-accent/10">
              <Globe className="w-8 h-8 text-accent" />
            </div>
            <p className="text-base text-foreground font-semibold mb-1">No monitors configured</p>
            <p className="text-sm text-muted-foreground mb-5">Start monitoring your services by adding your first website.</p>
            <Button size="default" asChild className="bg-gradient-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/20">
              <Link to="/websites/new">+ Add your first monitor</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
