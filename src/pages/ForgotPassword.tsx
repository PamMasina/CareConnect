import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Mail } from 'lucide-react'

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
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm opacity-80">Forgot your password?</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        {!sent ? (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-slate-500">Enter your registered email and we'll send you a reset link.</p>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Email address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-slate-50 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
              <Mail size={18} /> {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <p className="text-sm text-center text-slate-500">
              Remembered it? <Link to="/login" className="text-teal-600 font-medium">Sign in</Link>
            </p>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-teal-700">Email sent</h2>
            <p className="text-sm text-slate-500">Check your inbox for the password reset link.</p>
            <Link to="/login" className="inline-block bg-teal-600 text-white rounded-lg px-4 py-2">Back to sign in</Link>
          </div>
        )}
      </div>
      <Link to="/login" className="flex items-center gap-1 text-sm text-slate-500 justify-center">
        <ArrowLeft size={14} /> Back
      </Link>
    </div>
  )
}