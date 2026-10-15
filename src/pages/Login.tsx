import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
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
    else navigate(location.state?.from || '/')
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">CareConnect</h1>
        <p className="text-sm opacity-80">Connecting Patients With Healthcare</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <p className="text-sm text-slate-500">Sign in to your account</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Email</label>
            <input
              type="email" required placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full bg-slate-50 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Password</label>
            <input
              type="password" required placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full bg-slate-50 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-teal-600 font-medium">Forgot password?</Link>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-500">
          New here? <Link to="/signup" className="text-teal-600 font-medium">Create account</Link>
        </p>
      </div>
    </div>
  )
}
