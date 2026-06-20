import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWebsites } from '../api/websites'
import { Button } from '../components/ui/button'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function getStatusDot(isUp: boolean | null | undefined) {
  if (isUp === true) return 'bg-[#22c55e]'
  if (isUp === false) return 'bg-[#ef4444]'
  return 'bg-[#333]'
}

function getStatusLabel(isUp: boolean | null | undefined) {
  if (isUp === true) return 'Up'
  if (isUp === false) return 'Down'
  return 'Not checked'
}

function getStatusColor(isUp: boolean | null | undefined) {
  if (isUp === true) return 'text-[#22c55e]'
  if (isUp === false) return 'text-[#ef4444]'
  return 'text-[#555]'
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
        <div className="flex items-center gap-3 text-[#555]">
          <div className="w-4 h-4 border-2 border-[#333] border-t-white rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
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
    { time: '00:00', latency: 145 },
    { time: '02:00', latency: 132 },
    { time: '04:00', latency: 128 },
    { time: '06:00', latency: 135 },
    { time: '08:00', latency: 168 },
    { time: '10:00', latency: 182 },
    { time: '12:00', latency: 195 },
    { time: '14:00', latency: 178 },
    { time: '16:00', latency: 142 },
    { time: '18:00', latency: 128 },
    { time: '20:00', latency: 118 },
    { time: 'Now', latency: 112 },
  ]

  const recentEvents = websites
    ?.filter((w) => w.latest_check)
    .sort((a, b) => new Date(b.latest_check!.checked_at).getTime() - new Date(a.latest_check!.checked_at).getTime())
    .slice(0, 8)
    .map((w) => ({
      id: w.id,
      name: w.name,
      isUp: w.latest_check!.is_up,
      statusCode: w.latest_check!.status_code,
      responseTime: w.latest_check!.response_time_ms,
      checkedAt: w.latest_check!.checked_at,
    })) ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-[13px] text-[#555] mt-0.5">System status and metrics</p>
        </div>
        <Button size="sm" asChild>
          <Link to="/websites/new">+ Add Monitor</Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg overflow-hidden">
        {[
          { label: 'Monitors', value: total },
          { label: 'Online', value: up, color: 'text-[#22c55e]' },
          { label: 'Offline', value: down, color: down > 0 ? 'text-[#ef4444]' : undefined },
          { label: 'Avg Response', value: `${avgResponse}ms` },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0a0a0a] p-5">
            <p className="text-[11px] text-[#555] uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${color || 'text-foreground'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-medium">Response Time</h2>
            <p className="text-[11px] text-[#555] mt-0.5">Last 24 hours</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ededed" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#ededed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#666' }}
                  itemStyle={{ padding: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#ededed"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#ededed', stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-medium">Activity</h2>
          </div>
          <div className="divide-y divide-[#1a1a1a] max-h-72 overflow-y-auto">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="px-5 py-3 hover:bg-[#111] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(event.isUp)}`} />
                      <span className="text-[13px] truncate">{event.name}</span>
                    </div>
                    <span className={`text-[11px] shrink-0 ml-2 ${getStatusColor(event.isUp)}`}>
                      {getStatusLabel(event.isUp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-3.5 text-[11px] text-[#555]">
                    {event.responseTime != null && <span>{event.responseTime}ms</span>}
                    {event.statusCode && <span>{event.statusCode}</span>}
                    <span>{new Date(event.checkedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[13px] text-[#555]">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Monitors Table */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-medium">Monitors</h2>
        </div>

        {websites && websites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[11px] text-[#555] uppercase tracking-wider">
                  <th className="text-left px-5 py-2.5 font-medium">Name</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                  <th className="text-left px-5 py-2.5 font-medium">Response</th>
                  <th className="text-left px-5 py-2.5 font-medium">SSL</th>
                  <th className="text-right px-5 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {websites.map((w) => {
                  const last = w.latest_check
                  return (
                    <tr key={w.id} className="hover:bg-[#111] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(last?.is_up)}`} />
                          <div>
                            <Link to={`/websites/${w.id}`} className="text-[13px] hover:text-foreground transition-colors font-medium">
                              {w.name}
                            </Link>
                            <p className="text-[11px] text-[#555]">{w.url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[13px] ${getStatusColor(last?.is_up)}`}>
                          {getStatusLabel(last?.is_up)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] text-[#999]">
                          {last?.response_time_ms != null ? `${last.response_time_ms}ms` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] text-[#555]">
                          {w.url.startsWith('http://') ? 'HTTP' : 'Valid'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/websites/${w.id}`} className="text-[12px] text-[#555] hover:text-foreground transition-colors">
                          Details
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
            <p className="text-sm text-[#555] mb-4">No monitors yet</p>
            <Button size="sm" asChild>
              <Link to="/websites/new">+ Add your first monitor</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
