import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, ArrowLeft, ArrowRight } from 'lucide-react'

const GENDERS = ['Male', 'Female', 'Other']
const ETHNICITIES = ['African', 'Coloured', 'Indian/Asian', 'White', 'Other']
const PROVINCES = ['Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West']

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [gender, setGender] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [contact, setContact] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [notify, setNotify] = useState('Email')

  const [streetNo, setStreetNo] = useState('')
  const [streetName, setStreetName] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Western Cape')
  const [postalCode, setPostalCode] = useState('')
  const [nokName, setNokName] = useState('')
  const [nokRelation, setNokRelation] = useState('')
  const [nokContact, setNokContact] = useState('')

  if (done) {
    return (
      <div className="max-w-sm mx-auto mt-10 bg-white rounded-2xl shadow p-6 text-center space-y-3">
        <h2 className="text-xl font-bold text-teal-700">Account created</h2>
        <p className="text-sm text-slate-500">Check your email to confirm, then sign in.</p>
        <button onClick={() => navigate('/login')} className="bg-teal-600 text-white rounded-lg px-4 py-2">Go to sign in</button>
      </div>
    )
  }

  const next = () => {
    setError('')
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) { setError('Please complete all required fields.'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      if (password !== confirm) { setError('Passwords do not match.'); return }
    }
    setStep(s => Math.min(2, s + 1))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fullName = `${firstName} ${lastName}`.trim()
    const res = await signUp(email, password, fullName, 'patient')
    setLoading(false)
    if (res.error) setError(res.error)
    else setDone(true)
  }

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm opacity-80">Patient: Step {step} of 2</p>
      </div>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">First name</label>
                <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Last name</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Confirm password</label>
              <input required type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="">...select...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Ethnicity</label>
                <select value={ethnicity} onChange={e => setEthnicity(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                  <option value="">...select...</option>
                  {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Contact number</label>
              <input value={contact} onChange={e => setContact(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">ID number</label>
              <input value={idNumber} onChange={e => setIdNumber(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Notification preference</label>
              <div className="flex gap-2 mt-1">
                {['SMS', 'Email', 'In-App'].map(n => (
                  <button type="button" key={n} onClick={() => setNotify(n)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium border ${notify === n ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-300'}`}>{n}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={next}
              className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2">
              Next: address & next of kin <ArrowRight size={18} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Street number</label>
                <input value={streetNo} onChange={e => setStreetNo(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Postal code</label>
                <input value={postalCode} onChange={e => setPostalCode(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Street name</label>
              <input value={streetName} onChange={e => setStreetName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Province</label>
                <select value={province} onChange={e => setProvince(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="border-t pt-3 space-y-3">
              <p className="font-semibold text-sm">Next of kin</p>
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase">Full name</label>
                <input value={nokName} onChange={e => setNokName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase">Relationship</label>
                  <input value={nokRelation} onChange={e => setNokRelation(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase">Contact number</label>
                  <input value={nokContact} onChange={e => setNokContact(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border rounded-lg py-2.5 font-semibold text-slate-600 flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-teal-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                <UserPlus size={18} /> {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </>
        )}

        {error && step === 1 && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-sm text-center text-slate-500">
          Already have an account? <Link to="/login" className="text-teal-600 font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  )
}