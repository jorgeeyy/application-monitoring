import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createWebsite } from '../api/websites'
import { websiteSchema, type WebsiteFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function AddWebsitePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: { check_interval: 60 },
  })

  const mutation = useMutation({
    mutationFn: (data: WebsiteFormData) => createWebsite(data),
    onSuccess: (website) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Website added')
      navigate(`/websites/${website.id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.url?.[0] || err.response?.data?.detail || 'Failed to add website')
    },
  })

  const onSubmit = (data: WebsiteFormData) => mutation.mutate(data)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link to="/websites" className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; All websites</Link>
        <h1 className="text-lg font-semibold text-foreground mt-1">Add Website</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Name</label>
          <Input placeholder="My Website" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">URL</label>
          <Input type="url" placeholder="https://example.com" {...register('url')} />
          {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Check interval (seconds)</label>
          <Input type="number" min={10} max={3600} {...register('check_interval', { valueAsNumber: true })} />
          {errors.check_interval && <p className="text-xs text-red-500">{errors.check_interval.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? 'Adding...' : 'Add Website'}
        </Button>
      </form>
    </div>
  )
}
