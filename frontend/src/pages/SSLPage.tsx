import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchWebsites, fetchSSLInfo } from '../api/websites'
import { Shield, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'

function SSLCircle({ daysRemaining, isValid }: { daysRemaining: number | null; isValid: boolean }) {
  const days = daysRemaining ?? 0
  const maxDays = 365
  const percentage = Math.min((days / maxDays) * 100, 100)
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-[68px] h-[68px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
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
          style={{ filter: `drop-shadow(0 0 4px ${isValid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>{days}</span>
      </div>
    </div>
  )
}

function SSLCard({ websiteId, websiteName, domain }: { websiteId: string; websiteName: string; domain: string }) {
  const { data: ssl } = useQuery({
    queryKey: ['ssl', websiteId],
    queryFn: () => fetchSSLInfo(websiteId),
    refetchInterval: 60_000,
  })

  return (
    <Link
      to={`/websites/${websiteId}`}
      className="block glass-card rounded-2xl p-5 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
            ssl?.is_valid ? 'bg-green-500/10' : ssl ? 'bg-red-500/10' : 'bg-muted/50'
          }`}>
            <Shield className={`w-5 h-5 ${ssl?.is_valid ? 'text-green-400' : ssl ? 'text-red-400' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{websiteName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{domain}</p>
          </div>
        </div>
        <span className={`badge-modern px-2.5 py-1 rounded-full border ${
          ssl?.is_valid
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : ssl
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-muted border-border text-muted-foreground'
        }`}>
          {ssl?.is_valid ? 'Valid' : ssl ? 'Invalid' : 'Unknown'}
        </span>
      </div>

      {ssl ? (
        <div className="flex items-center gap-4">
          <SSLCircle daysRemaining={ssl.days_remaining} isValid={ssl.is_valid} />
          <div className="flex-1 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
              <span className="text-muted-foreground">Issuer</span>
              <span className="text-foreground font-medium">{ssl.issuer || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/[0.03]">
              <span className="text-muted-foreground">Expires</span>
              <span className={`font-medium ${ssl.days_remaining !== null && ssl.days_remaining < 30 ? 'text-yellow-400' : 'text-foreground'}`}>
                {ssl.days_remaining !== null ? `${ssl.days_remaining} days` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground">View</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            {ssl.error_message && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400">{ssl.error_message}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-xs">Loading SSL data...</span>
          </div>
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
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading SSL certificates...</span>
        </div>
      </div>
    )
  }

  const total = websites?.length ?? 0
  const valid = websites?.filter((w) => w.latest_check?.is_up === true).length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold gradient-text">SSL Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor SSL certificate status across all your services.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Certificates', value: total, icon: Shield, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
          { label: 'Valid', value: valid, icon: CheckCircle2, color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400', iconBg: 'bg-green-500/10' },
          { label: 'Expiring Soon', value: total - valid, icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10', iconColor: 'text-red-400', iconBg: 'bg-red-500/10' },
        ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div key={label} className="stat-card glass-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-3xl font-bold ${iconColor}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {websites?.map((w, index) => (
          <div key={w.id} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
            <SSLCard websiteId={w.id} websiteName={w.name} domain={w.url} />
          </div>
        ))}
        {websites?.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-blue-600/10 flex items-center justify-center mx-auto mb-4 border border-accent/10">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <p className="text-base text-foreground font-semibold mb-1">No SSL certificates to monitor</p>
            <p className="text-sm text-muted-foreground">Add a website to start tracking its SSL certificate.</p>
          </div>
        )}
      </div>
    </div>
  )
}
