import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const [mobileNav, setMobileNav] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const navLinks = [
    { label: 'Platform', href: '#features' },
    { label: 'Docs', href: '#' },
  ]

  const features = [
    {
      title: 'Real-time Alerting',
      desc: 'Receive alerts the instant a check fails via Email, Slack, or webhooks.',
    },
    {
      title: 'Global Uptime',
      desc: 'Monitor from multiple locations worldwide for complete availability visibility.',
    },
    {
      title: 'SLA Management',
      desc: 'Track and enforce your SLA targets with automated reporting.',
    },
    {
      title: 'Incident Management',
      desc: 'Automated incident creation and escalation workflows.',
    },
    {
      title: 'Performance Analytics',
      desc: 'Deep insights into response times, uptime trends, and patterns.',
    },
    {
      title: 'SSL Monitoring',
      desc: 'Track certificate expiration and get reminders before they expire.',
    },
  ]

  const metrics = [
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '<50ms', label: 'Check Interval' },
    { value: '50+', label: 'Integrations' },
    { value: '10K+', label: 'Monitors' },
  ]

  return (
    <div className="min-h-screen bg-black text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                <span className="text-[11px] font-bold text-black">A</span>
              </div>
              <span className="text-sm font-semibold">AppMonitor</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] text-[#666] hover:text-foreground transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] text-[#666] hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-[13px] bg-white text-black px-3.5 py-1.5 rounded-md hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="md:hidden p-1.5 rounded-md text-[#666] hover:text-foreground hover:bg-[#111] transition-colors cursor-pointer"
          >
            {mobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        {mobileNav && (
          <div className="md:hidden border-t border-[#1a1a1a] bg-black/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileNav(false)}
                  className="block px-3 py-2 rounded-md text-[13px] text-[#666] hover:text-foreground hover:bg-[#111] transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="pt-2 border-t border-[#1a1a1a] flex flex-col gap-1">
                <Link to="/login" className="block px-3 py-2 rounded-md text-[13px] text-[#666] hover:text-foreground hover:bg-[#111] transition-colors text-center">
                  Sign in
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-[13px] font-medium bg-white text-black hover:bg-white/90 transition-colors text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Monitoring for the
            <br />
            modern stack
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#666] max-w-xl mx-auto leading-relaxed">
            Real-time visibility into your infrastructure. Detect outages in seconds,
            identify slowdowns, and keep systems running.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-[#333] text-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#111] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:p-6">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Uptime', value: '99.98%' },
                { label: 'Avg Response', value: '142ms' },
                { label: 'Checks Today', value: '2,847' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md border border-[#1a1a1a] bg-black p-3">
                  <p className="text-[10px] text-[#555] uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-semibold mt-1">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-[#1a1a1a] bg-black p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#555]">Response Time (24h)</span>
                <span className="text-xs text-[#22c55e]">-12%</span>
              </div>
              <div className="h-16 flex items-end gap-0.5">
                {Array.from({ length: 48 }, (_, i) => {
                  const h = 20 + Math.random() * 60
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-[#222]"
                      style={{ height: `${h}%` }}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="py-10 border-y border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[11px] text-[#444] uppercase tracking-widest mb-6">
            Trusted by engineering teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {['Vercel', 'Stripe', 'Linear', 'Supabase', 'Resend'].map((logo) => (
              <span key={logo} className="text-sm font-medium text-[#333]">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built for Reliability</h2>
            <p className="mt-3 text-sm text-[#666] max-w-md mx-auto">
              Everything you need to monitor, alert, and maintain your systems.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg overflow-hidden">
            {features.map(({ title, desc }) => (
              <div key={title} className="bg-[#0a0a0a] p-6 sm:p-8">
                <h3 className="text-sm font-semibold mb-2">{title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Built with the community</h2>
            <p className="mt-3 text-sm text-[#666]">Free and open source. No vendor lock-in.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg overflow-hidden">
            {metrics.map(({ value, label }) => (
              <div key={label} className="bg-[#0a0a0a] p-6 sm:p-8 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                <p className="text-xs text-[#666] mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mt-3 text-sm text-[#666] mb-8">
            Free and open source. Self-host or deploy anywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-black px-6 py-2.5 rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-[#333] text-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-[#111] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
              <span className="text-[9px] font-bold text-black">A</span>
            </div>
            <span className="text-[13px] font-medium">AppMonitor</span>
          </div>
          <p className="text-[12px] text-[#444]">
            &copy; 2026 AppMonitor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'GitHub', 'Discord'].map((s) => (
              <a key={s} href="#" className="text-[12px] text-[#444] hover:text-[#666] transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
