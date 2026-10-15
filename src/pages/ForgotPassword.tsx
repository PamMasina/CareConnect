import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Mail, CheckCircle2, Activity, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-500">CareConnect Patient & Staff Portal</p>
          </div>
        </div>

        {!sent ? (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered health portal email address. We'll send you a secure verification link to update your password.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-teal-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Mail size={16} />
              <span>{loading ? 'Sending verification...' : 'Send Password Reset Link'}</span>
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-teal-700 font-semibold hover:underline">
                Return to sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Reset Email Dispatched</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                If an account exists for <span className="font-semibold text-slate-800">{email}</span>, you will receive instructions shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}