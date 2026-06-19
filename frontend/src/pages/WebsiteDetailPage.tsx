import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import { fetchWebsite, fetchStats, fetchChecks, triggerCheck, deleteWebsite, fetchSSLInfo } from '../api/websites'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'

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
    enabled: !!id,
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
      toast.success('Website deleted')
      navigate('/')
    },
    onError: () => toast.error('Failed to delete'),
  })

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (!website) return <p className="text-red-600">Website not found</p>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/" className="text-sm text-blue-600 hover:underline mb-1 block">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-slate-900">{website.name}</h1>
          <p className="text-sm text-slate-500">{website.url}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending}>
            {checkMutation.isPending ? 'Checking...' : 'Check now'}
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>Delete</Button>
        </div>
      </div>

      {checkMutation.data && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-sm">
            <p className="font-medium text-blue-800 mb-1">Check result</p>
            <p>
              Uptime: {checkMutation.data.uptime.is_up ? 'UP' : 'DOWN'} ({checkMutation.data.uptime.status_code}) &middot; {checkMutation.data.uptime.response_time_ms}ms
            </p>
            <p>
              SSL: <span className={checkMutation.data.ssl.is_valid ? 'text-green-700' : 'text-red-700'}>
                {checkMutation.data.ssl.is_valid ? 'Valid' : 'Invalid'}
              </span> &middot; {checkMutation.data.ssl.issuer ?? 'N/A'} &middot; {checkMutation.data.ssl.days_remaining ?? 0} days
            </p>
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '24h uptime', value: stats.uptime_percentage_24h, suffix: '%' },
            { label: '7d uptime', value: stats.uptime_percentage_7d, suffix: '%' },
            { label: '30d uptime', value: stats.uptime_percentage_30d, suffix: '%' },
            { label: 'Avg response', value: stats.average_response_time_ms ?? '-', suffix: 'ms' },
          ].map(({ label, value, suffix }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}<span className="text-sm font-normal text-slate-400 ml-1">{suffix}</span></p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {ssl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SSL Certificate</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Status: </span>
              {ssl.is_valid
                ? <Badge variant="success">Valid</Badge>
                : <Badge variant="destructive">{ssl.error_message || 'Invalid'}</Badge>}
            </div>
            <div><span className="text-slate-500">Issuer: </span>{ssl.issuer || '-'}</div>
            <div><span className="text-slate-500">Subject: </span>{ssl.subject || '-'}</div>
            <div><span className="text-slate-500">Expires: </span>{ssl.days_remaining !== null ? `${ssl.days_remaining} days` : '-'}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {checks && checks.length > 0 ? (
            <div className="space-y-2">
              {checks.slice(0, 20).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={c.is_up ? 'success' : 'destructive'} className="px-2 py-0">{c.is_up ? 'UP' : 'DOWN'}</Badge>
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
            <p className="text-sm text-slate-400">No checks yet. Click "Check now" to run one.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete website?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{website.name}" and all its check history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
