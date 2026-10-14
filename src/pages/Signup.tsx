import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../lib/types'
import { UserPlus } from 'lucide-react'

const STAFF_ROLES: { value: Role; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'first_responder', label: 'First Responder' },
  { value: 'admin', label: 'Admin' },
]

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const res = await signUp(email, password, fullName, role)
    setLoading(false)
    if (res.error) setError(res.error)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto mt-10 bg-white rounded-2xl shadow p-6 text-center space-y-3">
        <h2 className="text-xl font-bold text-teal-700">Account created</h2>
        <p className="text-sm text-slate-500">Check your email to confirm, then sign in.</p>
        <button onClick={() => navigate('/login')} className="bg-teal-600 text-white rounded-lg px-4 py-2">Go to sign in</button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-teal-700 text-center">Create account</h1>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Full name" value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input required type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input required type="password" placeholder="Password (min 6)" value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <select value={role} onChange={e => setRole(e.target.value as Role)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            {STAFF_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="text-xs text-slate-400">Role selection is for demo/setup. In production, staff roles are assigned by an admin.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
            <UserPlus size={18} /> {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-teal-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
