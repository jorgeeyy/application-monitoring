import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { registerSchema, type RegisterFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Activity, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data)
      toast.success('Account created')
    } catch (err: any) {
      toast.error(err.response?.data?.password?.[0] || err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative z-10">
        <div className="max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-accent/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Start monitoring today</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Set up your first monitor in under 2 minutes. No credit card required.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: 'Free', label: 'Starter plan' },
              { value: '5', label: 'Free monitors' },
              { value: '60s', label: 'Min interval' },
            ].map(({ value, label }) => (
              <div key={label} className="glass-card rounded-xl p-4">
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="lg:hidden text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent via-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">Start monitoring your websites in minutes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
              <Input
                type="email"
                {...reg('email')}
                placeholder="you@example.com"
                className="h-11 bg-white/[0.03] border-white/[0.06] focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First name</label>
                <Input
                  {...reg('first_name')}
                  placeholder="John"
                  className="h-11 bg-white/[0.03] border-white/[0.06] focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
                />
                {errors.first_name && <p className="text-xs text-red-400">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last name</label>
                <Input
                  {...reg('last_name')}
                  placeholder="Doe"
                  className="h-11 bg-white/[0.03] border-white/[0.06] focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
                />
                {errors.last_name && <p className="text-xs text-red-400">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  {...reg('password')}
                  placeholder="Create a strong password"
                  className="h-11 bg-white/[0.03] border-white/[0.06] focus:border-accent/30 focus:bg-white/[0.05] rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm password</label>
              <Input
                type="password"
                {...reg('password_confirm')}
                placeholder="Confirm your password"
                className="h-11 bg-white/[0.03] border-white/[0.06] focus:border-accent/30 focus:bg-white/[0.05] rounded-xl"
              />
              {errors.password_confirm && <p className="text-xs text-red-400">{errors.password_confirm.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-accent to-blue-600 hover:shadow-lg hover:shadow-accent/20 text-sm font-semibold rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
