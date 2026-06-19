import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { registerSchema, type RegisterFormData } from '../schemas'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data)
      toast.success('Account created')
    } catch (err: any) {
      toast.error(err.response?.data?.password?.[0] || err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...reg('email')} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...reg('first_name')} />
                {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...reg('last_name')} />
                {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...reg('password')} />
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirm">Confirm password</Label>
              <Input id="password_confirm" type="password" {...reg('password_confirm')} />
              {errors.password_confirm && <p className="text-sm text-red-600">{errors.password_confirm.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
