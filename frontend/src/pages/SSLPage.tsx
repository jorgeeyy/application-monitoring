import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWebsites, fetchSSLInfo } from '../api/websites'

function SSLCircle({ daysRemaining, isValid }: { daysRemaining: number | null; isValid: boolean }) {
  const days = daysRemaining ?? 0
  const maxDays = 365
  const percentage = Math.min((days / maxDays) * 100, 100)
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-[68px] h-[68px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-border)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={isValid ? '#22c55e' : '#ef4444'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold ${isValid ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{days}</span>
      </div>
    </div>
  )
}

function SSLCard({ websiteId, websiteName, domain }: { websiteId: string; websiteName: string; domain: string }) {
  const isHttp = domain.startsWith('http://')
  const { data: ssl } = useQuery({
    queryKey: ['ssl', websiteId],
    queryFn: () => fetchSSLInfo(websiteId),
    enabled: !isHttp,
  })

  const isValid = ssl?.is_valid && !isHttp

  return (
    <Link
      to={`/websites/${websiteId}`}
      className="block rounded-lg border border-border bg-card p-5 hover:bg-accent transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate">{websiteName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{domain}</p>
        </div>
        <span className={`text-[11px] shrink-0 ml-3 ${
          isValid ? 'text-[#22c55e]' : isHttp ? 'text-[#f59e0b]' : ssl ? 'text-[#ef4444]' : 'text-muted-foreground'
        }`}>
          {isValid ? 'Valid' : isHttp ? 'HTTP' : ssl ? 'Invalid' : 'Not checked'}
        </span>
      </div>

      {ssl && !isHttp ? (
        <div className="flex items-center gap-4">
          <SSLCircle daysRemaining={ssl.days_remaining} isValid={ssl.is_valid} />
          <div className="flex-1 space-y-2 text-[12px]">
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
            {ssl.error_message && (
              <p className="text-[11px] text-[#ef4444] mt-2">{ssl.error_message}</p>
            )}
          </div>
        </div>
      ) : isHttp ? (
        <div className="text-center py-4 text-[12px] text-muted-foreground">
          HTTP only — no SSL
        </div>
      ) : (
        <div className="text-center py-4 text-[12px] text-muted-foreground">
          Loading...
        </div>
      )}
    </Link>
  )
}

export default function SSLPage() {
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: fetchWebsites,
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

  const total = websites?.length ?? 0
  const valid = websites?.filter((w) => w.latest_check?.is_up === true).length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">SSL Certificates</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Monitor SSL certificate status across all services.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total },
          { label: 'Valid', value: valid, color: 'text-[#22c55e]' },
          { label: 'Issues', value: total - valid, color: total - valid > 0 ? 'text-[#ef4444]' : undefined },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border p-5 rounded-lg">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${color || 'text-foreground'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {websites?.map((w) => (
          <SSLCard key={w.id} websiteId={w.id} websiteName={w.name} domain={w.url} />
        ))}
        {websites?.length === 0 && (
          <div className="col-span-full rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No monitors yet. Add a website to start tracking SSL.</p>
          </div>
        )}
      </div>
    </div>
  )
}
