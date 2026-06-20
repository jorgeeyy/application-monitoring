import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { fetchWebsite, fetchStats, fetchChecks, triggerCheck, deleteWebsite, fetchSSLInfo, triggerSSLCheck } from '../api/websites'
import { Button } from '../components/ui/button'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'

function getStatusLabel(isUp: boolean | null | undefined) {
  if (isUp === true) return 'Up'
  if (isUp === false) return 'Down'
  return 'Not checked'
}

function getStatusColor(isUp: boolean | null | undefined) {
  if (isUp === true) return 'text-[#22c55e]'
  if (isUp === false) return 'text-[#ef4444]'
  return 'text-muted-foreground'
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
        <circle cx="45" cy="45" r="40" fill="none" stroke="var(--color-border)" strokeWidth="6" />
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
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${isValid ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{days}</span>
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
    onError: () => toast.error('Check failed'),
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
          <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }
  if (!website) return <p className="text-sm text-red-500">Website not found</p>

  const lastCheck = website.latest_check

  const chartData = checks
    ?.slice()
    .reverse()
    .slice(0, 30)
    .map((c) => ({
      time: new Date(c.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      response: c.response_time_ms || 0,
    })) ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/websites" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            ← Monitors
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-lg font-semibold truncate">{website.url}</h1>
            <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
              ↗
            </a>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-[13px] ${getStatusColor(lastCheck?.is_up)}`}>
              {getStatusLabel(lastCheck?.is_up)}
            </span>
            {lastCheck && (
              <span className="text-[12px] text-muted-foreground">
                {lastCheck.response_time_ms != null && `${lastCheck.response_time_ms}ms`}
                {lastCheck.response_time_ms != null && lastCheck.status_code && ' · '}
                {lastCheck.status_code && `${lastCheck.status_code}`}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/websites/${id}/edit`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent border border-border transition-colors"
          >
            Edit
          </Link>
          <Button
            size="sm"
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
          >
            {checkMutation.isPending ? 'Checking...' : 'Check now'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Response Time */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[13px] font-medium">Response Time</span>
            <span className="text-[11px] text-muted-foreground">
              Avg: {stats?.average_response_time_ms ?? '-'}ms
            </span>
          </div>
          <div className="p-5">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ededed" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#ededed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: 'var(--color-foreground)',
                    }}
                    labelStyle={{ color: 'var(--color-muted-foreground)' }}
                    formatter={(value) => [`${value}ms`, 'Response']}
                  />
                  <Area type="monotone" dataKey="response" stroke="#ededed" strokeWidth={1.5} fillOpacity={1} fill="url(#colorResponse)" dot={false} activeDot={{ r: 4, fill: '#ededed', stroke: '#0a0a0a', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[140px] text-[13px] text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* SSL */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-[13px] font-medium">SSL Certificate</span>
            {website.url.startsWith('https://') && (
              <button
                onClick={() => sslCheckMutation.mutate()}
                disabled={sslCheckMutation.isPending}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                {sslCheckMutation.isPending ? 'Checking...' : 'Re-check'}
              </button>
            )}
          </div>
          <div className="p-5 flex flex-col items-center">
            {website.url.startsWith('http://') ? (
              <div className="py-4 text-center">
                <p className="text-[13px] text-muted-foreground">HTTP only</p>
                <p className="text-[11px] text-muted-foreground mt-1">No SSL to monitor</p>
              </div>
            ) : ssl ? (
              <>
                <SSLCircle daysRemaining={ssl.days_remaining} isValid={ssl.is_valid} />
                <div className="mt-4 space-y-2 w-full text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={ssl.is_valid ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                      {ssl.is_valid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuer</span>
                    <span className="text-foreground">{ssl.issuer || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className={ssl.days_remaining !== null && ssl.days_remaining < 30 ? 'text-[#f59e0b]' : 'text-foreground'}>
                      {ssl.days_remaining !== null ? `${ssl.days_remaining} days` : '-'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4 text-[13px] text-muted-foreground">No SSL data</div>
            )}
          </div>
        </div>

        {/* Uptime */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-[13px] font-medium">Uptime</span>
          </div>
          <div className="p-5">
            {stats ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.uptime_percentage_24h}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1">24h availability</p>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      stats.uptime_percentage_24h >= 99 ? 'bg-[#22c55e]' :
                      stats.uptime_percentage_24h >= 95 ? 'bg-[#f59e0b]' :
                      'bg-[#ef4444]'
                    }`}
                    style={{ width: `${stats.uptime_percentage_24h}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">7d</p>
                    <p className="text-lg font-semibold mt-0.5">{stats.uptime_percentage_7d}%</p>
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">30d</p>
                    <p className="text-lg font-semibold mt-0.5">{stats.uptime_percentage_30d}%</p>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total checks</p>
                  <p className="text-lg font-semibold mt-0.5">{stats.total_checks.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-[13px] text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-[13px] font-medium">Event Log</span>
          {checks && checks.length > 0 && (
            <span className="text-[11px] text-muted-foreground">Last {Math.min(checks.length, 20)}</span>
          )}
        </div>
        {checks && checks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2.5 font-medium">Time</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                  <th className="text-left px-5 py-2.5 font-medium">Response</th>
                  <th className="text-left px-5 py-2.5 font-medium">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {checks.slice(0, 20).map((c) => (
                  <tr key={c.id} className="hover:bg-accent transition-colors">
                    <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
                      {new Date(c.checked_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`text-[12px] ${getStatusColor(c.is_up)}`}>
                        {c.is_up ? 'Up' : 'Down'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
                      {c.response_time_ms ? `${c.response_time_ms}ms` : '-'}
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
                      {c.is_up
                        ? `HTTP ${c.status_code}`
                        : c.error_message || `HTTP ${c.status_code}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[13px] text-muted-foreground">
            No events yet. Click "Check now" to run your first check.
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete monitor?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{website.name}" and all its check history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowDelete(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="flex-1">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
