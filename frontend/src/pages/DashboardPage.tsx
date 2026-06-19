import { useQuery } from '@tanstack/react-query'
import { fetchWebsites } from '../api/websites'
import WebsiteCard from '../components/WebsiteCard'

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
          {websites.map((w) => (
            <WebsiteCard key={w.id} website={w} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500 mb-4">No websites being monitored yet.</p>
          <a href="/websites/new" className="text-blue-600 hover:underline text-sm">
            Add your first website
          </a>
        </div>
      )}
    </div>
  )
}
