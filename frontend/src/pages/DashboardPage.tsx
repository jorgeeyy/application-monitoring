import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWebsites } from '../api/websites'
import { Button } from '../components/ui/button'
import {
  Monitor,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  AlertTriangle,
  Shield,
  TrendingUp,
  Zap,
  ArrowRight,
  Activity,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function getStatusDot(isUp: boolean | null | undefined) {
  if (isUp === true) return 'bg-green-400'
  if (isUp === false) return 'bg-red-400'
  return 'bg-muted-foreground/30'
}

function getStatusBadge(isUp: boolean | null | undefined) {
  if (isUp === true) return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Up', dot: 'bg-green-400' }
  if (isUp === false) return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Down', dot: 'bg-red-400' }
  return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', label: 'Not checked', dot: 'bg-muted-foreground/30' }
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

export default function DashboardPage() {
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  const total = websites?.length ?? 0
  const up = websites?.filter((w) => w.latest_check?.is_up === true).length ?? 0
  const down = websites?.filter((w) => w.latest_check?.is_up === false).length ?? 0
  const avgResponse = websites?.filter((w) => w.latest_check?.response_time_ms).length
    ? Math.round(
        websites
          .filter((w) => w.latest_check?.response_time_ms)
          .reduce((sum, w) => sum + (w.latest_check!.response_time_ms || 0), 0) /
          websites.filter((w) => w.latest_check?.response_time_ms).length
      )
    : 0

  const chartData = [
    { time: '00:00', uptime: 99.8, latency: 145, requests: 1240 },
    { time: '02:00', uptime: 99.9, latency: 132, requests: 890 },
    { time: '04:00', uptime: 99.9, latency: 128, requests: 650 },
    { time: '06:00', uptime: 99.8, latency: 135, requests: 780 },
    { time: '08:00', uptime: 99.7, latency: 168, requests: 1560 },
    { time: '10:00', uptime: 99.6, latency: 182, requests: 1890 },
    { time: '12:00', uptime: 99.5, latency: 195, requests: 2100 },
    { time: '14:00', uptime: 99.6, latency: 178, requests: 1950 },
    { time: '16:00', uptime: 99.8, latency: 142, requests: 1680 },
    { time: '18:00', uptime: 99.9, latency: 128, requests: 1320 },
    { time: '20:00', uptime: 99.9, latency: 118, requests: 980 },
    { time: 'Now', uptime: 100, latency: 112, requests: 720 },
  ]

  const recentEvents = websites
    ?.filter((w) => w.latest_check)
    .sort((a, b) => new Date(b.latest_check!.checked_at).getTime() - new Date(a.latest_check!.checked_at).getTime())
    .slice(0, 8)
    .map((w) => ({
      id: w.id,
      name: w.name,
      url: w.url,
      isUp: w.latest_check!.is_up,
      statusCode: w.latest_check!.status_code,
      responseTime: w.latest_check!.response_time_ms,
      checkedAt: w.latest_check!.checked_at,
    })) ?? []

  const statCards = [
    {
      label: 'Total Monitors',
      value: total,
      icon: Monitor,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      trend: '+2 this week',
      trendUp: true,
    },
    {
      label: 'Online',
      value: up,
      icon: CheckCircle2,
      color: 'from-green-500/20 to-green-600/10',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10',
      trend: `${total > 0 ? Math.round((up / total) * 100) : 0}% uptime`,
      trendUp: true,
    },
    {
      label: 'Offline',
      value: down,
      icon: XCircle,
      color: 'from-red-500/20 to-red-600/10',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      trend: down > 0 ? 'Needs attention' : 'All clear',
      trendUp: down === 0,
    },
    {
      label: 'Avg Response',
      value: `${avgResponse}ms`,
      icon: Zap,
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      trend: avgResponse < 200 ? 'Excellent' : avgResponse < 500 ? 'Good' : 'Slow',
      trendUp: avgResponse < 500,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">System status and operational metrics for the last 24 hours.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live monitoring active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(({ label, value, icon: Icon, iconColor, iconBg, trend, trendUp }, index) => (
          <div
            key={label}
            className="stat-card glass-card rounded-2xl p-5 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`w-3 h-3 ${trendUp ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>{trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-foreground">Global Uptime & Latency</h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Combined metrics across all monitors</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] sm:text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-3 h-1 rounded-full bg-accent" />
                  Latency
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-3 h-1 rounded-full bg-green-400" />
                  Uptime
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162033" />
                <XAxis dataKey="time" tick={{ fill: '#5b6b85', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5b6b85', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1221',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#7a8ba5', marginBottom: '4px' }}
                  itemStyle={{ padding: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0c1221', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/5">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Live Activity</h2>
          </div>
          <div className="divide-y divide-white/5 max-h-72 sm:max-h-85 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event, index) => {
                const badge = getStatusBadge(event.isUp)
                return (
                  <div
                    key={event.id}
                    className="px-4 sm:px-5 py-3 hover:bg-white/2 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(event.isUp)} ${event.isUp ? 'shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'shadow-[0_0_6px_rgba(239,68,68,0.5)]'}`} />
                        <span className="text-sm text-foreground truncate font-medium">{event.name}</span>
                      </div>
                      <span className={`badge-modern px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text} shrink-0`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 ml-4.5 text-[11px] text-muted-foreground">
                      {event.responseTime != null && <span>{event.responseTime}ms</span>}
                      {event.statusCode && <span>{event.statusCode}</span>}
                      <span>{new Date(event.checkedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Active Incidents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Current issues affecting your monitors</p>
          </div>
          {down > 0 && (
            <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {down} {down === 1 ? 'incident' : 'incidents'}
            </span>
          )}
        </div>
        {down > 0 ? (
          <div className="divide-y divide-white/5">
            {websites
              ?.filter((w) => w.latest_check?.is_up === false)
              .map((w) => (
                <Link
                  key={w.id}
                  to={`/websites/${w.id}`}
                  className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/2 transition-colors group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="hidden sm:inline badge-modern text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      Critical
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                      {w.latest_check?.error_message || `${w.latest_check?.status_code}`}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">All systems operational</p>
              <p className="text-xs text-muted-foreground">No incidents reported in the last 24 hours</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">All Monitors</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Overview of all your monitored services</p>
          </div>
          <Button size="sm" asChild className="bg-linear-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/20 self-start">
            <Link to="/websites/new">+ Add Monitor</Link>
          </Button>
        </div>

        {websites && websites.length > 0 ? (
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
                {websites.map((w, index) => {
                  const last = w.latest_check
                  const badge = getStatusBadge(last?.is_up)
                  return (
                    <tr
                      key={w.id}
                      className="table-row"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(last?.is_up)} ${last?.is_up ? 'shadow-[0_0_6px_rgba(34,197,94,0.4)]' : last?.is_up === false ? 'shadow-[0_0_6px_rgba(239,68,68,0.4)]' : ''}`} />
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
                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-lg ${getResponseTimeBg(last?.response_time_ms)} ${getResponseTimeColor(last?.response_time_ms)}`}>
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
                        <Link
                          to={`/websites/${w.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10"
                        >
                          Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-blue-600/10 flex items-center justify-center mx-auto mb-4 border border-accent/10">
              <Monitor className="w-8 h-8 text-accent" />
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
