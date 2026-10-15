import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { CLINICS } from '../lib/clinics'
import { ArrowLeft, Save, CheckCircle2, User, Building2, MapPin, HeartHandshake } from 'lucide-react'

export default function EditProfile() {
  const { profile, user, refreshProfile, role } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [clinic, setClinic] = useState('')
  const [streetNo, setStreetNo] = useState('14')
  const [streetName, setStreetName] = useState('Main Rd')
  const [city, setCity] = useState('Cape Town')
  const [suburb, setSuburb] = useState('Langa')
  const [nokName, setNokName] = useState('Zola Mbeki')
  const [nokRelation, setNokRelation] = useState('Spouse')
  const [nokContact, setNokContact] = useState('+27 72 999 8877')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const parts = (profile?.full_name || '').split(' ')
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' '))
    setEmail(user?.email || '')
    setPhone(profile?.phone || '')
    setClinic((user as any)?.user_metadata?.clinic || profile?.clinic || 'Langa CHC')
    const addr = (user as any)?.user_metadata?.address
    if (addr) {
      setStreetNo(addr.streetNo || streetNo)
      setStreetName(addr.streetName || streetName)
      setSuburb(addr.suburb || suburb)
      setCity(addr.city || city)
    }
    const nok = (user as any)?.user_metadata?.next_of_kin
    if (nok) {
      setNokName(nok.name || nokName)
      setNokRelation(nok.relationship || nokRelation)
      setNokContact(nok.phone || nokContact)
    }
  }, [profile, user])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (!user) {
      setError('Not signed in.')
      return
    }
    setSaving(true)
    const { error: metaErr } = await supabase.auth.updateUser({
      data: {
        clinic,
        address: { streetNo, streetName, suburb, city },
        next_of_kin: { name: nokName, relationship: nokRelation, phone: nokContact },
      },
    })
    if (metaErr) console.error('metadata update error:', metaErr.message)
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: `${firstName} ${lastName}`.trim(), phone, clinic })
      .eq('id', user.id)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    await supabase.auth.refreshSession()
    await refreshProfile()
    navigate('/profile')
  }

  const clinicNames = Array.from(new Set(CLINICS.map(c => c.name)))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-0.5">
              <User size={14} />
              <span>Patient Profile Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit Health Profile
            </h1>
          </div>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 size={14} />
            <span>Profile Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Personal Details */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={18} className="text-teal-600" />
            <h2 className="font-bold text-base text-slate-900">Personal Identification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                disabled
                value={email}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+27 71 000 0000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </section>

        {/* Primary Facility Selection (staff only) */}
        {role !== 'patient' && (
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 size={18} className="text-teal-600" />
              <h2 className="font-bold text-base text-slate-900">Assigned Primary Healthcare Facility</h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Clinic or Community Health Centre
              </label>
              <select
                value={clinic}
                onChange={e => setClinic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {clinicNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Your preferred clinic for routine chronic medication collection and consultation queues.
              </p>
            </div>
          </section>
        )}

        {/* Residential Address */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin size={18} className="text-teal-600" />
            <h2 className="font-bold text-base text-slate-900">Residential Address</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Number
              </label>
              <input
                value={streetNo}
                onChange={e => setStreetNo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Name
              </label>
              <input
                value={streetName}
                onChange={e => setStreetName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Suburb / Area
              </label>
              <input
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Municipality / City
              </label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </section>

        {/* Next of Kin */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <HeartHandshake size={18} className="text-teal-600" />
            <h2 className="font-bold text-base text-slate-900">Next of Kin (Emergency Contact)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Full Name
              </label>
              <input
                value={nokName}
                onChange={e => setNokName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Relationship
              </label>
              <input
                value={nokRelation}
                onChange={e => setNokRelation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Emergency Phone
              </label>
              <input
                value={nokContact}
                onChange={e => setNokContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </section>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={15} />
            <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}