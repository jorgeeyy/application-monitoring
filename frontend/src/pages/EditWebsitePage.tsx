import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchWebsite, updateWebsite, deleteWebsite } from '../api/websites'
import { websiteSchema, type WebsiteFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog'

export default function EditWebsitePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)

  const { data: website, isLoading } = useQuery({
    queryKey: ['website', id],
    queryFn: () => fetchWebsite(id!),
    enabled: !!id,
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    values: website ? {
      name: website.name,
      url: website.url,
      check_interval: website.check_interval,
    } : undefined,
  })

  const watchedInterval = watch('check_interval')

  const updateMutation = useMutation({
    mutationFn: (data: WebsiteFormData) => updateWebsite(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      queryClient.invalidateQueries({ queryKey: ['website', id] })
      toast.success('Monitor updated')
      navigate(`/websites/${id}`)
    },
    onError: (err: any) => toast.error(err.response?.data?.url?.[0] || err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteWebsite(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Monitor deleted')
      navigate('/websites')
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  })

  const onSubmit = (data: WebsiteFormData) => updateMutation.mutate(data)

  const intervalOptions = [
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 900, label: '15m' },
    { value: 3600, label: '1h' },
  ]

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

  if (!website) return <p className="text-sm text-red-500">Monitor not found</p>

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/websites/${id}`}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Edit Monitor</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{website.name}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDelete(true)}
          className="text-[#ef4444] border-[#ef4444]/20 hover:bg-[#ef4444]/10"
        >
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">Name</label>
            <Input
              placeholder="My Website"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">URL</label>
            <Input
              type="url"
              placeholder="https://example.com"
              {...register('url')}
            />
            {errors.url && <p className="text-xs text-red-400">{errors.url.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">Check Interval</label>
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
                        : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {errors.check_interval && <p className="text-xs text-red-400">{errors.check_interval.message}</p>}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <Link
            to={`/websites/${id}`}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete monitor?</DialogTitle>
            <DialogDescription>
              This will permanently delete "{website.name}" and all its check history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowDelete(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="flex-1">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
