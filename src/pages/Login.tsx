import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homePathForRole } from '../lib/routes'
import { LogIn, Activity, ShieldCheck, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

// Image asset generated for healthcare consultation
import consultationImg from '../assets/images/medical_consultation_1792062791299.jpg'

export default function Login() {
  const { signIn, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn(email, password)
    setLoading(false)
    if (res.error) setError(res.error)
    else navigate(location.state?.from || homePathForRole(role))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to CareConnect Home</span>
        </Link>
        <span className="text-xs text-slate-400">Cape Town Health Network</span>
      </div>

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* =========================================================================
            LEFT COLUMN: Editorial Healthcare Showcase (Desktop only or top banner)
           ========================================================================= */}
        <div className="lg:col-span-7 bg-slate-900 text-white relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
          {/* Background image with contrast gradient scrim */}
          <img
            src={consultationImg}
            alt="Cape Town Healthcare Consultation"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-teal-950/70" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-emerald-200 mb-6">
              <Activity size={14} className="text-emerald-400" />
              <span>Western Cape Public Health Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Accessible, Dignified Healthcare for Every Community
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Book consultations at your local community clinic, track real-time waiting queues from your phone, and summon verified emergency responders with one tap.
            </p>
          </div>

          {/* Pillars Checklist */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>Direct bookings across 20+ Cape Town CHCs & Day Centres</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <Clock size={18} className="text-emerald-400 shrink-0" />
              <span>Real-time queue transparency — know when your turn arrives</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <MapPin size={18} className="text-emerald-400 shrink-0" />
              <span>GPS-assisted emergency SOS linked directly to local EMS dispatch</span>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Cape Town · Western Cape</span>
            <span className="font-mono tabular-nums text-emerald-300">Emergency Dispatch: 10177</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Sign In Form & Role Switcher
           ========================================================================= */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                <p className="text-xs text-slate-500 mt-1">Access your patient portal or staff console</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                CC
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-teal-700 font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-700 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn size={16} />
                <span>{loading ? 'Authenticating...' : 'Sign in to CareConnect'}</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link to="/signup" className="text-teal-700 font-semibold hover:underline">
                  Create your account
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
