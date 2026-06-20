import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createWebsite } from '../api/websites'
import { websiteSchema, type WebsiteFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ArrowLeft, Globe, LinkIcon, Clock, ArrowRight, Activity, Shield, Zap, Info } from 'lucide-react'

export default function AddWebsitePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: { check_interval: 60 },
  })

  const watchedUrl = watch('url')
  const watchedInterval = watch('check_interval')

  const mutation = useMutation({
    mutationFn: (data: WebsiteFormData) => createWebsite(data),
    onSuccess: (website) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Monitor created successfully')
      navigate(`/websites/${website.id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.url?.[0] || err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to add monitor')
    },
  })

  const onSubmit = (data: WebsiteFormData) => mutation.mutate(data)

  const intervalOptions = [
    { value: 30, label: '30s', desc: 'Fast' },
    { value: 60, label: '1m', desc: 'Recommended' },
    { value: 300, label: '5m', desc: 'Standard' },
    { value: 900, label: '15m', desc: 'Budget' },
    { value: 3600, label: '1h', desc: 'Basic' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/websites"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">Add Monitor</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Set up uptime monitoring for your website or service.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">First check runs automatically</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <h2 className="text-sm sm:text-base font-semibold text-foreground">Monitor Details</h2>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      placeholder="My Website"
                      {...register('name')}
                      className="pl-10 h-11 bg-white/[0.03] border-white/5 focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      type="url"
                      placeholder="https://example.com or http://subdomain.example.com"
                      {...register('url')}
                      className="pl-10 h-11 bg-white/[0.03] border-white/5 focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
                    />
                  </div>
                  {errors.url && (
                    <p className="text-xs text-red-400">{errors.url.message}</p>
                  )}
                </div>
              </div>

              {watchedUrl && !errors.url && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  {watchedUrl.startsWith('https://') ? (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  <span>Monitoring target: <span className="text-foreground font-medium">{watchedUrl}</span></span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    watchedUrl.startsWith('https://') ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {watchedUrl.startsWith('https://') ? 'HTTPS' : 'HTTP'}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Check Interval</label>
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {intervalOptions.map(({ value, label, desc }) => {
                    const isSelected = Number(watchedInterval) === value
                    return (
                      <label
                        key={value}
                        onClick={() => setValue('check_interval', value, { shouldValidate: true })}
                        className={`relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-gradient-to-b from-accent/15 to-accent/5 border-accent/40 text-accent shadow-lg shadow-accent/15 scale-[1.02]'
                            : 'bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.01]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                        )}
                        <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-accent' : ''}`}>{label}</span>
                        <span className={`text-[10px] sm:text-[11px] ${isSelected ? 'text-accent/60' : 'opacity-50'}`}>{desc}</span>
                      </label>
                    )
                  })}
                </div>
                {errors.check_interval && (
                  <p className="text-xs text-red-400">{errors.check_interval.message}</p>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 sm:py-5 border-t border-white/5 bg-white/[0.01]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Your website will be checked every <span className="text-foreground font-semibold">{watchedInterval || 60}s</span> from multiple locations worldwide.
                </p>
                <Button
                  type="submit"
                  className="h-11 px-8 bg-gradient-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/25 text-sm font-semibold rounded-xl shrink-0"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {mutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Monitor
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">What happens next</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { icon: Zap, text: 'First check runs immediately', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { icon: Clock, text: `Checks every ${watchedInterval || 60} seconds`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { icon: Shield, text: 'SSL certificate tracked', color: 'text-green-400', bg: 'bg-green-500/10' },
              ].map(({ icon: Icon, text, color, bg }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Supported protocols</h3>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {['HTTPS', 'HTTP', 'TCP', 'DNS'].map((proto) => (
                  <span key={proto} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-muted-foreground font-medium">
                    {proto}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick tips</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                'Use a descriptive name to identify this monitor easily.',
                'Enter the full URL including https://.',
                '30s interval is great for critical services.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
