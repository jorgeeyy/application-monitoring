import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWebsites } from '../api/websites'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export default function DashboardPage() {
  const { data: websites, isLoading, error } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
    refetchInterval: 30_000,
  })

  if (isLoading) return <p className="text-slate-500">Loading websites...</p>
  if (error) return <p className="text-red-600">Failed to load websites</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Websites</h1>
        <span className="text-sm text-slate-500">{websites?.length ?? 0} monitored</span>
      </div>

      {websites && websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((w) => {
            const last = w.latest_check
            return (
              <Link key={w.id} to={`/websites/${w.id}`} className="block">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{w.name}</CardTitle>
                      <Badge variant={last?.is_up ? 'success' : last?.is_up === false ? 'destructive' : 'outline'}>
                        {last?.is_up ? 'UP' : last?.is_up === false ? 'DOWN' : 'N/A'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-500 space-y-1">
                    <p className="truncate">{w.url}</p>
                    {last ? (
                      <div className="flex gap-4">
                        <span>{last.status_code}</span>
                        <span>{last.response_time_ms}ms</span>
                        <span>{new Date(last.checked_at).toLocaleString()}</span>
                      </div>
                    ) : (
                      <p>No checks yet</p>
                    )}
                    <p>Every {w.check_interval}s</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent>
            <p className="text-slate-500 mb-4">No websites being monitored yet.</p>
            <Button asChild>
              <Link to="/websites/new">Add your first website</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
