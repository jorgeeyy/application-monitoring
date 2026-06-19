import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createWebsite } from '../api/websites'
import { websiteSchema, type WebsiteFormData } from '../schemas'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
    <div className="max-w-lg">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-4 block">&larr; Back</Link>
      <Card>
        <CardHeader>
          <CardTitle>Add Website</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="My Website" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" type="url" placeholder="https://example.com" {...register('url')} />
              {errors.url && <p className="text-sm text-red-600">{errors.url.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_interval">Check interval (seconds)</Label>
              <Input id="check_interval" type="number" min={10} max={3600} {...register('check_interval', { valueAsNumber: true })} />
              {errors.check_interval && <p className="text-sm text-red-600">{errors.check_interval.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Website'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
