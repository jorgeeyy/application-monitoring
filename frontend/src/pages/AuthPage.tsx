import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { useEffect } from 'react'

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [mode, setMode] = useState<'login' | 'register'>(location.pathname === '/register' ? 'register' : 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (user) return <Navigate to="/dashboard" replace />

  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Signed in')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed')
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    try {
      await register(data)
      toast.success('Account created')
    } catch (err: any) {
      toast.error(err.response?.data?.password?.[0] || err.response?.data?.detail || 'Registration failed')
    }
  }

  const switchMode = (newMode: 'login' | 'register') => {
    setShowPassword(false)
    setMode(newMode)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-sm font-semibold text-foreground">AppMonitor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className={`text-[13px] transition-colors ${
                mode === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className={`text-[13px] px-3 py-1.5 rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-accent'
              }`}
            >
              Get Started
            </Link>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {/* Tab switcher */}
          <div className="flex items-center gap-0 border-b border-border mb-8">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                mode === 'login'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                mode === 'register'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Login form */}
          {mode === 'login' && (
            <div className="animate-fade-in">
              <div className="space-y-1 mb-6">
                <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Sign in to your account</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="you@example.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-9 mt-2"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <p className="text-[13px] text-center text-muted-foreground mt-6">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-foreground font-medium hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* Register form */}
          {mode === 'register' && (
            <div className="animate-fade-in">
              <div className="space-y-1 mb-6">
                <h1 className="text-xl font-semibold text-foreground">Create account</h1>
                <p className="text-sm text-muted-foreground">Start monitoring your websites</p>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    {...registerForm.register('email')}
                    placeholder="you@example.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-muted-foreground">First name</label>
                    <Input
                      {...registerForm.register('first_name')}
                      placeholder="John"
                    />
                    {registerForm.formState.errors.first_name && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] text-muted-foreground">Last name</label>
                    <Input
                      {...registerForm.register('last_name')}
                      placeholder="Doe"
                    />
                    {registerForm.formState.errors.last_name && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...registerForm.register('password')}
                      placeholder="Create a strong password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">Confirm password</label>
                  <Input
                    type="password"
                    {...registerForm.register('password_confirm')}
                    placeholder="Confirm your password"
                  />
                  {registerForm.formState.errors.password_confirm && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password_confirm.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-9 mt-2"
                  disabled={registerForm.formState.isSubmitting}
                >
                  {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <p className="text-[13px] text-center text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-foreground font-medium hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
