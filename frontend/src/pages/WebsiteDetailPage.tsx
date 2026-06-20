import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { fetchWebsite, fetchStats, fetchChecks, triggerCheck, deleteWebsite, fetchSSLInfo, triggerSSLCheck } from '../api/websites'
import { Button } from '../components/ui/button'
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  RefreshCw,
  Shield,
  TrendingUp,
  Clock,
  Activity,
  Pencil,
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

function getStatusBadge(isUp: boolean | null | undefined) {
  if (isUp === true) return { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'Up', dot: 'bg-green-400' }
  if (isUp === false) return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', label: 'Down', dot: 'bg-red-400' }
  return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', label: 'Unknown', dot: 'bg-muted-foreground/30' }
}

function getResponseTimeColor(ms: number | null | undefined) {
  if (ms == null) return 'text-muted-foreground'
  if (ms < 200) return 'text-green-400'
  if (ms < 500) return 'text-yellow-400'
  return 'text-red-400'
}

function SSLCircle({ daysRemaining, isValid }: { daysRemaining: number | null; isValid: boolean }) {
  const days = daysRemaining ?? 0
  const maxDays = 365
  const percentage = Math.min((days / maxDays) * 100, 100)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-[100px] h-[100px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
        <circle
          cx="45"
          cy="45"
          r="40"
          fill="none"
          stroke={isValid ? '#22c55e' : '#ef4444'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${isValid ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>{days}</span>
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Days Left</span>
      </div>
    </div>
  )
}

export default function WebsiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)

  const { data: website, isLoading } = useQuery({
    queryKey: ['website', id],
    queryFn: () => fetchWebsite(id!),
    enabled: !!id,
  })

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => fetchStats(id!),
    enabled: !!id,
    refetchInterval: 30_000,
  })

  const { data: checks } = useQuery({
    queryKey: ['checks', id],
    queryFn: () => fetchChecks(id!),
    enabled: !!id,
  })

  const { data: ssl } = useQuery({
    queryKey: ['ssl', id],
    queryFn: () => fetchSSLInfo(id!),
    enabled: !!id && !!website && website.url.startsWith('https://'),
  })

  const checkMutation = useMutation({
    mutationFn: () => triggerCheck(id!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stats', id] })
      queryClient.invalidateQueries({ queryKey: ['checks', id] })
      queryClient.invalidateQueries({ queryKey: ['website', id] })
      queryClient.invalidateQueries({ queryKey: ['ssl', id] })
      toast.success(
        data.uptime.is_up
          ? `UP - ${data.uptime.status_code} (${data.uptime.response_time_ms}ms)`
          : `DOWN - ${data.uptime.error_message || data.uptime.status_code}`
      )
    },
    onError: () => toast.error('Check failed — try again'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWebsite(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Monitor deleted')
      navigate('/websites')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  })

  const sslCheckMutation = useMutation({
    mutationFn: () => triggerSSLCheck(id!),
    onSuccess: (data) => {
      queryClient.setQueryData(['ssl', id], data)
      toast.success(data.is_valid ? `SSL valid — ${data.days_remaining} days remaining` : `SSL invalid — ${data.error_message || 'certificate issue'}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'SSL check failed'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading monitor details...</span>
        </div>
      </div>
    )
  }
  if (!website) return <p className="text-sm text-red-500">Website not found</p>

  const lastCheck = website.latest_check
  const badge = getStatusBadge(lastCheck?.is_up)

  const chartData = checks
    ?.slice()
    .reverse()
    .slice(0, 30)
    .map((c) => ({
      time: new Date(c.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: c.response_time_ms || 0,
    })) ?? []

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/websites" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            All Monitors
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate">{website.url}</h1>
            <a href={website.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border ${badge.bg} ${badge.border} ${badge.text}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot} ${lastCheck?.is_up ? 'shadow-[0_0_6px_rgba(34,197,94,0.5)]' : lastCheck?.is_up === false ? 'shadow-[0_0_6px_rgba(239,68,68,0.5)]' : ''}`} />
              {badge.label}
            </span>
            {lastCheck && (
              <span className="text-[11px] sm:text-xs text-muted-foreground">
                {lastCheck.response_time_ms != null && `${lastCheck.response_time_ms}ms`}
                {lastCheck.response_time_ms != null && lastCheck.status_code && ' · '}
                {lastCheck.status_code && `${lastCheck.status_code}`}
                {lastCheck.response_time_ms != null || lastCheck.status_code ? ' · ' : ''}
                Last check: {new Date(lastCheck.checked_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/websites/${id}/edit`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-white/5 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <Button
            size="sm"
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
            className="bg-gradient-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{checkMutation.isPending ? 'Checking...' : 'Check now'}</span>
            <span className="sm:hidden">{checkMutation.isPending ? '...' : 'Check'}</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowDelete(true)} className="border-white/5 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">Response Time</h2>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
                <span className="text-muted-foreground">Last: <span className={getResponseTimeColor(lastCheck?.response_time_ms)}>{lastCheck?.response_time_ms ?? '-'}ms</span></span>
                <span className="text-muted-foreground">Avg: <span className="text-foreground font-medium">{stats?.average_response_time_ms ?? '-'}ms</span></span>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" tick={{ fill: '#5b6b85', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5b6b85', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1221',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                    labelStyle={{ color: '#7a8ba5', marginBottom: '4px' }}
                    formatter={(value) => [`${value}ms`, 'Response']}
                  />
                  <Area type="monotone" dataKey="response" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResponse)" dot={false} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0c1221', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px]">
                <p className="text-xs text-muted-foreground">No response time data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <h2 className="text-xs sm:text-sm font-semibold text-foreground">SSL Certificate</h2>
              </div>
              {website.url.startsWith('https://') && (
                <button
                  onClick={() => sslCheckMutation.mutate()}
                  disabled={sslCheckMutation.isPending}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-white/5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${sslCheckMutation.isPending ? 'animate-spin' : ''}`} />
                  {sslCheckMutation.isPending ? 'Checking...' : 'Re-check SSL'}
                </button>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col items-center">
            {website.url.startsWith('http://') ? (
              <>
                <div className="w-[100px] h-[100px] rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-amber-400/60" />
                </div>
                <div className="mt-5 space-y-2.5 w-full text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-amber-400">HTTP Only</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-muted-foreground">No SSL certificate to monitor</span>
                  </div>
                </div>
              </>
            ) : ssl ? (
              <>
                <SSLCircle daysRemaining={ssl.days_remaining} isValid={ssl.is_valid} />
                <div className="mt-5 space-y-2.5 w-full text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-semibold ${ssl.is_valid ? 'text-green-400' : 'text-red-400'}`}>
                      {ssl.is_valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="text-foreground font-medium">{ssl.issuer || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">Expires</span>
                    <span className={`font-medium ${ssl.days_remaining !== null && ssl.days_remaining < 30 ? 'text-yellow-400' : 'text-foreground'}`}>
                      {ssl.days_remaining !== null ? `${ssl.days_remaining} days` : '-'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[160px]">
                <p className="text-xs text-muted-foreground">No SSL data</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h2 className="text-xs sm:text-sm font-semibold text-foreground">24h Uptime History</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {stats ? (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{stats.uptime_percentage_24h}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Availability</p>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                      stats.uptime_percentage_24h >= 99 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      stats.uptime_percentage_24h >= 95 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                      'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{
                      width: `${stats.uptime_percentage_24h}%`,
                      boxShadow: stats.uptime_percentage_24h >= 99 ? '0 0 12px rgba(34, 197, 94, 0.4)' :
                                  stats.uptime_percentage_24h >= 95 ? '0 0 12px rgba(245, 158, 11, 0.4)' :
                                  '0 0 12px rgba(239, 68, 68, 0.4)'
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">7 day</p>
                    <p className="text-lg font-bold text-foreground">{stats.uptime_percentage_7d}%</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">30 day</p>
                    <p className="text-lg font-bold text-foreground">{stats.uptime_percentage_30d}%</p>
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total checks</p>
                  <p className="text-lg font-bold text-foreground">{stats.total_checks.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-xs text-muted-foreground">No uptime data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Event Log</h2>
          </div>
          {checks && checks.length > 0 && (
            <span className="text-xs text-muted-foreground">Last {Math.min(checks.length, 20)} events</span>
          )}
        </div>
        {checks && checks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-semibold">Time</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-left px-6 py-3 font-semibold">Response</th>
                  <th className="text-left px-6 py-3 font-semibold">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {checks.slice(0, 20).map((c, index) => {
                  const cBadge = getStatusBadge(c.is_up)
                  return (
                    <tr
                      key={c.id}
                      className="table-row animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {new Date(c.checked_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`badge-modern inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${cBadge.bg} ${cBadge.border} ${cBadge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cBadge.dot}`} />
                          {c.is_up ? 'Up' : 'Down'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-medium ${getResponseTimeColor(c.response_time_ms)}`}>
                          {c.response_time_ms ? `${c.response_time_ms}ms` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {c.is_up
                          ? `HTTP ${c.status_code}`
                          : c.error_message || `HTTP ${c.status_code}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-3 border border-white/5">
              <Clock className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No events yet</p>
            <p className="text-xs text-muted-foreground">Click "Check now" to run your first check.</p>
          </div>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDelete(false)}>
          <div
            className="glass-card rounded-2xl p-6 w-full max-w-sm space-y-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Delete monitor?</h3>
              <p className="text-xs text-muted-foreground mt-2">This will permanently delete "{website.name}" and all its check history.</p>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={() => setShowDelete(false)} className="flex-1 border-white/5 hover:bg-white/[0.03]">
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="flex-1">
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
