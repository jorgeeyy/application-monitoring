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
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
  })

  const watchedUrl = watch('url')

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

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          to="/websites"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Add Monitor</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Set up uptime monitoring for your website.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">Name</label>
            <Input
              placeholder="My Website"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">URL</label>
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
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full ${watchedUrl.startsWith('https://') ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'}`} />
              <span>
                {watchedUrl.startsWith('https://') ? 'HTTPS' : 'HTTP'} site
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Checked every <span className="text-foreground">60s</span>
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
