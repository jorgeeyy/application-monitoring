import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createWebsite } from '../api/websites'
import { websiteSchema, type WebsiteFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ArrowLeft } from 'lucide-react'

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
      toast.success('Monitor created')
      navigate(`/websites/${website.id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.url?.[0] || err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to add monitor')
    },
  })

  const onSubmit = (data: WebsiteFormData) => mutation.mutate(data)

  const intervalOptions = [
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 900, label: '15m' },
    { value: 3600, label: '1h' },
  ]

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/websites"
          className="p-1.5 rounded-md text-[#555] hover:text-foreground hover:bg-[#111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Add Monitor</h1>
          <p className="text-[13px] text-[#555] mt-0.5">Set up uptime monitoring for your website.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999]">Name</label>
            <Input
              placeholder="My Website"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999]">URL</label>
            <Input
              type="url"
              placeholder="https://example.com"
              {...register('url')}
            />
            {errors.url && (
              <p className="text-xs text-red-400">{errors.url.message}</p>
            )}
          </div>

          {watchedUrl && !errors.url && (
            <div className="flex items-center gap-2 text-[12px] text-[#555]">
              <div className={`w-1.5 h-1.5 rounded-full ${watchedUrl.startsWith('https://') ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
              <span>
                {watchedUrl.startsWith('https://') ? 'HTTPS' : 'HTTP'} site
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[13px] text-[#999]">Check Interval</label>
            <div className="flex gap-2">
              {intervalOptions.map(({ value, label }) => {
                const isSelected = Number(watchedInterval) === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('check_interval', value, { shouldValidate: true })}
                    className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent text-[#555] border-[#333] hover:border-[#555]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {errors.check_interval && (
              <p className="text-xs text-red-400">{errors.check_interval.message}</p>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[#1a1a1a] flex items-center justify-between">
          <p className="text-[12px] text-[#555]">
            Checked every <span className="text-foreground">{watchedInterval || 60}s</span>
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create Monitor'}
          </Button>
        </div>
      </form>
    </div>
  )
}
