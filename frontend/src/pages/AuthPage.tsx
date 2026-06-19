import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../schemas'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Activity, ArrowRight, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function AuthPage() {
  const { user, login, register } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState<'login' | 'register'>(location.pathname === '/register' ? 'register' : 'login')
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen bg-[#050a14] flex relative overflow-hidden pt-14">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative z-10">
        <div className="max-w-md text-center space-y-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Start monitoring today'}
          </h2>
          <p className="text-base text-white/40 leading-relaxed">
            {mode === 'login'
              ? 'Monitor your websites uptime, response times, and SSL certificates in real-time.'
              : 'Set up your first monitor in under 2 minutes. No credit card required.'}
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            {mode === 'login' ? (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-white/30 mt-1">Uptime SLA</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">&lt;50ms</p>
                  <p className="text-xs text-white/30 mt-1">Check Interval</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">24/7</p>
                  <p className="text-xs text-white/30 mt-1">Monitoring</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Free</p>
                  <p className="text-xs text-white/30 mt-1">Starter plan</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-xs text-white/30 mt-1">Free monitors</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">60s</p>
                  <p className="text-xs text-white/30 mt-1">Min interval</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Tab switcher */}
          <div className="flex items-center bg-white/[0.04] rounded-xl p-1 mb-8 border border-white/[0.06]">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#050a14] shadow-lg'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#050a14] shadow-lg'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Form container with transition */}
          <div className="relative overflow-hidden">
            <div
              className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: mode === 'login' ? 'translateX(0)' : 'translateX(-100%)',
                opacity: mode === 'login' ? 1 : 0,
                position: mode === 'login' ? 'relative' : 'absolute',
                width: '100%',
                pointerEvents: mode === 'login' ? 'auto' : 'none',
              }}
            >
              <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Sign in</h1>
                <p className="text-sm text-white/40">Enter your credentials to access your dashboard</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type="email"
                      {...loginForm.register('email')}
                      placeholder="you@example.com"
                      className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 text-white placeholder:text-white/20"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="Enter your password"
                      className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 pr-10 text-white placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors cursor-pointer"
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
                  className="w-full h-11 bg-white text-[#050a14] hover:bg-white/90 text-sm font-semibold rounded-xl"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#050a14]/20 border-t-[#050a14] rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <p className="text-xs text-center text-white/30 mt-6">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </div>

            <div
              className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: mode === 'register' ? 'translateX(0)' : 'translateX(100%)',
                opacity: mode === 'register' ? 1 : 0,
                position: mode === 'register' ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                pointerEvents: mode === 'register' ? 'auto' : 'none',
              }}
            >
              <div className="space-y-2 mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Create account</h1>
                <p className="text-sm text-white/40">Start monitoring your websites in minutes</p>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type="email"
                      {...registerForm.register('email')}
                      placeholder="you@example.com"
                      className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 text-white placeholder:text-white/20"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">First name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input
                        {...registerForm.register('first_name')}
                        placeholder="John"
                        className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 text-white placeholder:text-white/20"
                      />
                    </div>
                    {registerForm.formState.errors.first_name && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Last name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input
                        {...registerForm.register('last_name')}
                        placeholder="Doe"
                        className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 text-white placeholder:text-white/20"
                      />
                    </div>
                    {registerForm.formState.errors.last_name && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...registerForm.register('password')}
                      placeholder="Create a strong password"
                      className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 pr-10 text-white placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      type="password"
                      {...registerForm.register('password_confirm')}
                      placeholder="Confirm your password"
                      className="h-11 bg-white/[0.04] border-white/[0.08] focus:border-cyan-500/40 focus:bg-white/[0.06] rounded-xl pl-10 text-white placeholder:text-white/20"
                    />
                  </div>
                  {registerForm.formState.errors.password_confirm && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password_confirm.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-white text-[#050a14] hover:bg-white/90 text-sm font-semibold rounded-xl"
                  disabled={registerForm.formState.isSubmitting}
                >
                  {registerForm.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#050a14]/20 border-t-[#050a14] rounded-full animate-spin" />
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

              <p className="text-xs text-center text-white/30 mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Top nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050a14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-white">AppMonitor</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className={`text-[13px] font-medium transition-colors ${
                mode === 'login' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className={`text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors ${
                mode === 'register'
                  ? 'bg-white text-[#050a14]'
                  : 'border border-white/15 text-white hover:bg-white/[0.04]'
              }`}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}
