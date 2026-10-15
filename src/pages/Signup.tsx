import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, ArrowLeft, ArrowRight, CheckCircle2, Activity, ShieldCheck, MapPin } from 'lucide-react'

const GENDERS = ['Male', 'Female', 'Other']
const ETHNICITIES = ['African', 'Coloured', 'Indian/Asian', 'White', 'Other']
const PROVINCES = [
  'Western Cape',
  'Eastern Cape',
  'Northern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
]

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
  const [city, setCity] = useState('Cape Town')
  const [province, setProvince] = useState('Western Cape')
  const [postalCode, setPostalCode] = useState('')
  const [nokName, setNokName] = useState('')
  const [nokRelation, setNokRelation] = useState('')
  const [nokContact, setNokContact] = useState('')

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Account Created</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Your profile has been registered on the CareConnect network. You can now sign in to book clinic appointments and access waiting queue status.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-teal-600 text-white rounded-xl py-3 text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Sign In to Patient Portal
            </button>
          </div>
        </div>
      </div>
    )
  }

  const next = () => {
    setError('')
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setError('Please complete all required fields.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirm) {
        setError('Passwords do not match.')
        return
      }
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-xl w-full mb-3 flex items-center justify-between">
        <Link
          to="/"
          className="text-xs font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to CareConnect Home</span>
        </Link>
        <span className="text-xs text-slate-400">Cape Town Health Network</span>
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Activity size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Patient Account</h1>
              <p className="text-xs text-slate-500">Western Cape Public Health Network</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Step {step} of 2
          </span>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name *
                  </label>
                  <input
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">...select...</option>
                    {GENDERS.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="+27..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  SA National ID / Passport
                </label>
                <input
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder="e.g. 9001015800085"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="button"
                onClick={next}
                className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue: Address & Emergency Contact</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Street Number
                  </label>
                  <input
                    value={streetNo}
                    onChange={e => setStreetNo(e.target.value)}
                    placeholder="14"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Postal Code
                  </label>
                  <input
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="7455"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Name
                </label>
                <input
                  value={streetName}
                  onChange={e => setStreetName(e.target.value)}
                  placeholder="Main Road, Langa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / Town
                  </label>
                  <input
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Province
                  </label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next of Kin */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Emergency Contact / Next of Kin
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Name</label>
                  <input
                    value={nokName}
                    onChange={e => setNokName(e.target.value)}
                    placeholder="Full name of spouse, parent or relative"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Relationship</label>
                    <input
                      value={nokRelation}
                      onChange={e => setNokRelation(e.target.value)}
                      placeholder="e.g. Sister, Spouse"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number</label>
                    <input
                      value={nokContact}
                      onChange={e => setNokContact(e.target.value)}
                      placeholder="+27..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 font-semibold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <UserPlus size={15} />
                  <span>{loading ? 'Creating account...' : 'Complete Patient Registration'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-teal-700 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}