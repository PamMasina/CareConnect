import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SosAlert } from '../lib/types'
import { MapPin, Phone } from 'lucide-react'

export default function Emergency() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<SosAlert | null>(null)
  const [emergencyType, setEmergencyType] = useState('')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locError, setLocError] = useState('')
  const [error, setError] = useState('')

  const captureLocation = () => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported by this device.'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const emergencyTypes = ['Breathing difficult', 'Injury/accident', 'Chest pain', 'Medical', 'Unconscious', 'Other']
  const trigger = async () => {
    setError('')
    if (!emergencyType) { setError('Please select an emergency type.'); return }
    setSubmitting(true)
    if (!location) captureLocation()
    const reason = [`Emergency type: ${emergencyType}`, message.trim()].filter(Boolean).join('. ')
    const { data, error: err } = await supabase.from('sos_alerts').insert({
      patient_id: user!.id,
      latitude: location?.lat ?? null,
      longitude: location?.lng ?? null,
      message: reason || 'I need medical help now.',
      status: 'active',
    }).select().single()
    setSubmitting(false)
    if (err) setError(err.message)
    else {
      setAlert(data as SosAlert)
      if (!location) captureLocation()
    }
  }

  const cancel = async () => {
    if (!alert) return
    await supabase.from('sos_alerts').update({ status: 'cancelled' }).eq('id', alert.id)
    setAlert(null)
  }

  if (alert) {
    const maps = alert.latitude && alert.longitude
      ? `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`
      : null
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow p-6 text-center space-y-4">
        <div className="mx-auto w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1e8d2b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-lg font-bold">Emergency alert reported successfully!</h2>
        <p className="text-sm text-slate-600">Your emergency will be attended shortly<br/>You will be contacted!</p>
        <p className="text-sm text-slate-500">Please stay put as our dedicated team evaluates your case</p>
        {maps && (
          <a href={maps} target="_blank" rel="noreferrer" className="inline-block text-sm text-teal-700 underline">
            View my location
          </a>
        )}
        <button onClick={() => { setAlert(null) }} className="w-full bg-teal-700 text-white rounded-xl py-3 font-medium">
          Continue to app
        </button>
        <button onClick={cancel} className="w-full border border-slate-300 rounded-lg py-2.5 text-sm">
          I'm safe — cancel alert
        </button>
      </div>
      <a href="tel:10177" className="block bg-white rounded-xl shadow p-4 flex items-center gap-3">
        <Phone className="text-red-600" /> <span className="font-medium">Call ambulance (10177)</span>
      </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-red-700">Emergency</h1>
      <p className="text-sm text-slate-500">
        Press the SOS button to alert first responders. They will see your location and details in their dashboard.
      </p>

      <div className="flex flex-col items-center py-6">
        <button
          onClick={trigger}
          disabled={submitting}
          className="w-44 h-44 rounded-full bg-red-600 text-white text-2xl font-bold shadow-lg sos-pulse flex items-center justify-center disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'SOS'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <p className="text-sm font-medium">Emergency type</p>
        <div className="flex flex-wrap gap-2">
          {emergencyTypes.map(t => (
            <button key={t} type="button" onClick={() => setEmergencyType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${emergencyType === t ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'}`}>
              {t}
            </button>
          ))}
        </div>
        <label className="text-sm font-medium">Additional details (optional)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2}
          placeholder="Describe the situation briefly..."
          className="w-full border rounded-lg px-3 py-2" />
        <label className="text-sm font-medium">Your address</label>
        <p className="text-xs text-slate-500">14 Main Rd, Langa, Cape Town</p>
        <button onClick={captureLocation}
          className="w-full border rounded-lg py-2 text-sm flex items-center justify-center gap-2">
          <MapPin size={16} /> {location ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Share your current location'}
        </button>
        {locError && <p className="text-xs text-red-600">{locError}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <a href="tel:112" className="block text-center text-sm text-slate-500 underline">
        If life-threatening, also call 112 (emergency)
      </a>
    </div>
  )
}
