import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Bell,
  Globe,
  AlertTriangle,
  FileText,
  BarChart3,
  Lock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  const navLinks = [
    { label: 'Platform', href: '#features' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Resources', href: '#resources' },
    { label: 'Pricing', href: '#pricing' },
  ]

  const trustedLogos = [
    'Motorola',
    'DoorDash',
    'BITWARDEN',
    'MEDUS',
    'Quantcast',
  ]

  const features = [
    {
      icon: Bell,
      title: 'Real-time Alerting',
      desc: 'Receive alerts the instant a check fails. Get notified via Email, Slack, or 50+ integrations before your users notice.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Globe,
      title: 'Global Uptime',
      desc: 'Monitor from multiple locations worldwide. Get a complete picture of your global availability.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: FileText,
      title: 'SLA Management',
      desc: 'Track and enforce your SLA targets with automated reporting. Never miss a commitment again.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: AlertTriangle,
      title: 'Incident Management',
      desc: 'Automated incident creation and escalation workflows to resolve issues quickly.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      desc: 'Deep insights into response times, uptime trends, and performance patterns across all monitors.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Lock,
      title: 'SSL Monitoring',
      desc: 'Track certificate expiration and get reminders before they expire. Never let a certificate lapse.',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
  ]

  const metrics = [
    { value: '99.99%', label: 'Uptime SLA', description: 'Enterprise-grade reliability' },
    { value: '<50ms', label: 'Response Time', description: 'Lightning-fast checks' },
    { value: '50+', label: 'Integrations', description: 'Connect your entire stack' },
    { value: '10K+', label: 'Monitors Active', description: 'Trusted by engineers' },
  ]

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050a14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-white">AppMonitor</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-[13px] font-medium text-white/50 hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[13px] font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-[13px] font-semibold bg-white text-[#050a14] px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-[52px] font-bold leading-[1.1] tracking-tight">
              Monitoring for the modern{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                SRE
              </span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed max-w-lg">
              Total-time visibility into your entire infrastructure. Detect outages in seconds, identify slowdowns, and keep systems running at peak performance.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#050a14] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/15 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/[0.04] transition-colors"
              >
                Book a Demo
              </Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>25,000+ engineers AND STAR CITIZEN</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-1 overflow-hidden">
              <div className="rounded-xl bg-[#0a1020] border border-white/[0.04] p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-[11px] text-white/30 ml-2">appmonitor.io/dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Uptime', value: '99.98%', color: 'text-green-400' },
                    { label: 'Avg Response', value: '142ms', color: 'text-cyan-400' },
                    { label: 'Checks Today', value: '2,847', color: 'text-blue-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.04]">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40">Response Time (24h)</span>
                    <span className="text-xs text-green-400 font-medium">-12% from yesterday</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const h = 20 + Math.random() * 60
                      const isHigh = h > 60
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-all ${
                            isHigh ? 'bg-amber-500/60' : 'bg-cyan-500/40'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  All systems operational
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip */}
      <section className="py-12 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold text-white/20 uppercase tracking-[0.2em] mb-8">
            Trusted by the world's most innovative teams
          </p>
          <div className="flex items-center justify-center gap-16">
            {trustedLogos.map((logo) => (
              <span key={logo} className="text-lg font-bold text-white/15 tracking-tight">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Engineered for Reliability</h2>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              A full suite of reliability tools, built from the ground up to give you complete visibility and peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bgColor }, index) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Activity className="w-3 h-3" />
              Platform
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Unrivaled Data Depth</h2>
            <p className="text-base text-white/40 leading-relaxed">
              Every check produces a rich log entry. Combine that with 1+ year retention, and you can find and fix issues you never knew existed.
            </p>
            <div className="space-y-4">
              {[
                { icon: BarChart3, text: 'X-Ray Resolution', desc: 'Find the root cause of any issue with deep data inspection.' },
                { icon: TrendingUp, text: 'Unlimited Retention', desc: 'Keep your data as long as you need. No artificial limits.' },
              ].map(({ icon: Icon, text, desc }) => (
                <div key={text} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{text}</p>
                    <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-1">
            <div className="rounded-xl bg-[#0a1020] border border-white/[0.04] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider">Response Time (ms)</p>
                  <p className="text-3xl font-bold text-cyan-400 mt-1">142ms</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  -12%
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'P50', value: '128ms', bar: 65 },
                  { label: 'P90', value: '185ms', bar: 80 },
                  { label: 'P99', value: '342ms', bar: 95 },
                ].map(({ label, value, bar }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">{label}</span>
                      <span className="text-white/60 font-medium">{value}</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500/60 to-cyan-400/80 rounded-full"
                        style={{ width: `${bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/30">30 day average</span>
                  <span className="text-white/50 font-medium">138ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-6">
            {metrics.map(({ value, label, description }) => (
              <div
                key={label}
                className="text-center p-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent"
              >
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm font-semibold text-white/60">{label}</p>
                <p className="text-xs text-white/30 mt-1">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to secure your uptime?</h2>
          <p className="text-base text-white/40 mb-8 max-w-lg mx-auto">
            Join 10,000+ engineering teams who trust AppMonitor to keep their systems running. Start monitoring in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 border border-white/15 text-white px-7 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/[0.04] transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-[#050a14] px-7 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-6 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] font-bold tracking-tight text-white">AppMonitor</span>
              </Link>
              <p className="text-xs text-white/30 leading-relaxed max-w-xs">
                Real-time monitoring, incident response and analytics platform for engineering teams.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'API'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Guides', 'Status', 'Community'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'GDPR'],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-[11px] text-white/20">
              © 2026 AppMonitor Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {['Twitter', 'GitHub', 'LinkedIn', 'Discord'].map((social) => (
                <a key={social} href="#" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
