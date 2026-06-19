import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchWebsite, fetchStats, fetchChecks, triggerCheck, deleteWebsite, fetchSSLInfo } from '../api/websites'

function StatCard({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">
        {value}{suffix && <span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

export default function WebsiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    enabled: !!id,
  })

  const checkMutation = useMutation({
    mutationFn: () => triggerCheck(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', id] })
      queryClient.invalidateQueries({ queryKey: ['checks', id] })
      queryClient.invalidateQueries({ queryKey: ['website', id] })
      queryClient.invalidateQueries({ queryKey: ['ssl', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWebsite(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      navigate('/')
    },
  })

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (!website) return <p className="text-red-600">Website not found</p>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/" className="text-sm text-blue-600 hover:underline mb-1 block">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-slate-900">{website.name}</h1>
          <p className="text-sm text-slate-500">{website.url}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => checkMutation.mutate()}
            disabled={checkMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {checkMutation.isPending ? 'Checking...' : 'Check now'}
          </button>
          <button
            onClick={() => { if (confirm('Delete this website?')) deleteMutation.mutate() }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {checkMutation.data && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
          <p className="font-medium text-blue-800 mb-2">Check result</p>
          <p>Status: {checkMutation.data.uptime.is_up ? 'UP' : 'DOWN'} ({checkMutation.data.uptime.status_code}) &middot; {checkMutation.data.uptime.response_time_ms}ms</p>
          <p>SSL: {checkMutation.data.ssl.is_valid ? 'Valid' : 'Invalid'} &middot; {checkMutation.data.ssl.issuer} &middot; {checkMutation.data.ssl.days_remaining ?? 0} days remaining</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="24h uptime" value={stats.uptime_percentage_24h} suffix="%" />
          <StatCard label="7d uptime" value={stats.uptime_percentage_7d} suffix="%" />
          <StatCard label="30d uptime" value={stats.uptime_percentage_30d} suffix="%" />
          <StatCard label="Avg response" value={stats.average_response_time_ms ?? '-'} suffix="ms" />
        </div>
      )}

      {/* SSL Info */}
      {ssl && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">SSL Certificate</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Status:</span> {ssl.is_valid ? <span className="text-green-600 font-medium">Valid</span> : <span className="text-red-600 font-medium">{ssl.error_message || 'Invalid'}</span>}</div>
            <div><span className="text-slate-500">Issuer:</span> {ssl.issuer || '-'}</div>
            <div><span className="text-slate-500">Subject:</span> {ssl.subject || '-'}</div>
            <div><span className="text-slate-500">Expires:</span> {ssl.days_remaining !== null ? `${ssl.days_remaining} days` : '-'}</div>
          </div>
        </div>
      )}

      {/* Recent Checks */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-900 mb-3">Recent Checks</h2>
        {checks && checks.length > 0 ? (
          <div className="space-y-2">
            {checks.slice(0, 20).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`inline-block w-2 h-2 rounded-full ${c.is_up ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={c.is_up ? 'text-green-700' : 'text-red-700'}>{c.is_up ? 'UP' : 'DOWN'}</span>
                  <span className="text-slate-500">{c.status_code}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{c.response_time_ms}ms</span>
                  <span>{new Date(c.checked_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No checks recorded yet. Click "Check now" to run the first one.</p>
        )}
      </div>
    </div>
  )
}
