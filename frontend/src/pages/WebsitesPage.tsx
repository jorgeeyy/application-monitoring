import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchWebsites } from '../api/websites'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Pagination } from '../components/ui/pagination'
import { Search } from 'lucide-react'

const PAGE_SIZE = 10

function getStatusDot(isUp: boolean | null | undefined) {
  if (isUp === true) return 'bg-[#22c55e]'
  if (isUp === false) return 'bg-[#ef4444]'
  return 'bg-ring'
}

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

export default function WebsitesPage() {
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
    refetchInterval: 30_000,
  })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-ring border-t-foreground rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  const filtered = websites?.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.url.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold">Monitors</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage and track your service uptime.</p>
        </div>
        <Button size="sm" asChild>
          <Link to="/websites/new">+ Add</Link>
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search monitors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-8 bg-transparent border-none focus:ring-0 text-[13px]"
            />
          </div>
          <span className="text-[11px] text-muted-foreground">{filtered.length} monitors</span>
        </div>

        {filtered.length > 0 ? (
          <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-5 py-2.5 font-medium">Name</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                  <th className="text-left px-5 py-2.5 font-medium">Response</th>
                  <th className="text-left px-5 py-2.5 font-medium">SSL</th>
                  <th className="text-right px-5 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((w) => {
                  const last = w.latest_check
                  return (
                    <tr key={w.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(last?.is_up)}`} />
                          <div>
                            <Link to={`/websites/${w.id}`} className="text-[13px] hover:text-foreground transition-colors font-medium">
                              {w.name}
                            </Link>
                            <p className="text-[11px] text-muted-foreground">{w.url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[13px] ${getStatusColor(last?.is_up)}`}>
                          {getStatusLabel(last?.is_up)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] text-muted-foreground">
                          {last?.response_time_ms != null ? `${last.response_time_ms}ms` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[13px] text-muted-foreground">
                          {w.url.startsWith('http://') ? 'HTTP' : 'Valid'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/websites/${w.id}`} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                          Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : search ? (
          <div className="p-12 text-center text-[13px] text-muted-foreground">
            No monitors match "{search}"
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">No monitors yet</p>
            <Button size="sm" asChild>
              <Link to="/websites/new">+ Add your first monitor</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
