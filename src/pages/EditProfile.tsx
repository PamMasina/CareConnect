import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { CLINICS } from '../lib/clinics'
import { ArrowLeft, Save, Trash2, Camera } from 'lucide-react'

export default function EditProfile() {
  const { profile, user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [clinic, setClinic] = useState('')
  const [streetNo, setStreetNo] = useState('')
  const [streetName, setStreetName] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('Western Cape')
  const [postalCode, setPostalCode] = useState('')
  const [nokName, setNokName] = useState('')
  const [nokRelation, setNokRelation] = useState('')
  const [nokContact, setNokContact] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const parts = (profile?.full_name || '').split(' ')
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' '))
    setEmail(user?.email || '')
    setPhone(profile?.phone || '')
    setClinic((user as any)?.user_metadata?.clinic || '')
  }, [profile, user])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    if (!user) { setError('Not signed in.'); return }
    setSaving(true)
    const { error: metaErr } = await supabase.auth.updateUser({ data: { clinic } })
    if (metaErr) { console.error('metadata update error:', metaErr.message) }
    const { error: err } = await supabase.from('profiles').update({ full_name: `${firstName} ${lastName}`.trim(), phone }).eq('id', user!.id)
    setSaving(false)
    if (err) {
      console.error('profile update error:', err.message)
      setError(err.message)
      return
    }
    await supabase.auth.refreshSession()
    await refreshProfile()
    setSaved(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Edit profile</h1>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        <div className="relative w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-teal-700">{(firstName[0] || '') + (lastName[0] || '')}</span>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <Camera size={14} />
          </button>
        </div>
        <button className="text-xs text-red-600 font-medium">Change photo</button>
      </div>

      <form onSubmit={save} className="bg-white rounded-2xl shadow p-4 space-y-4">
        <section className="space-y-3">
          <h2 className="font-semibold text-sm">Personal info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">First name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Last name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Email address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Contact number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="">...select...</option>
                {['Male','Female','Other'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 uppercase">Ethnicity</label>
              <select value={ethnicity} onChange={e => setEthnicity(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="">...select...</option>
                {['African','Coloured','Indian/Asian','White','Other'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t pt-3">
          <h2 className="font-semibold text-sm">Workplace (staff)</h2>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Clinic</label>
            <select value={clinic} onChange={e => setClinic(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="">Select your clinic</option>
              {Array.from(new Set(CLINICS.map(c => c.name))).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3 border-t pt-3">
          <h2 className="font-semibold text-sm">Address</h2>
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
                {['Western Cape','Eastern Cape','Northern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t pt-3">
          <h2 className="font-semibold text-sm">Next of kin</h2>
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
        </section>

        <section className="space-y-3 border-t pt-3">
          <h2 className="font-semibold text-sm">Change password</h2>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Current password</label>
            <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">New password</label>
            <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase">Confirm new password</label>
            <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
        </section>

        <section className="space-y-3 border-t pt-3">
          <h2 className="font-semibold text-sm">Notifications preferences</h2>
          <div className="flex gap-2">
            {['SMS', 'Email', 'In-App'].map(n => (
              <button type="button" key={n} className="flex-1 rounded-lg py-2 text-xs font-medium border bg-white text-slate-600 border-slate-300">{n}</button>
            ))}
          </div>
        </section>

        <button type="submit" disabled={saving}
          className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          <Save size={18} /> {saving ? 'Saving...' : 'Save changes'}
        </button>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {saved && <p className="text-sm text-green-600 text-center">Profile updated.</p>}

        <button type="button" className="w-full border border-red-300 text-red-600 rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2">
          <Trash2 size={18} /> Delete account
        </button>
      </form>
    </div>
  )
}