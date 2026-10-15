import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SosAlert } from '../lib/types'
import { MapPin, Phone, AlertTriangle, CheckCircle2, ShieldAlert, Navigation, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import ambulanceImg from '../assets/images/emergency_response_1792062793067.jpg'

export default function Emergency() {
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState<SosAlert | null>(null)
  const [emergencyType, setEmergencyType] = useState('Breathing difficulty')
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>({
    lat: -33.9485,
    lng: 18.5284,
  })
  const [locError, setLocError] = useState('')
  const [error, setError] = useState('')

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by this browser.')
      return
    }
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const emergencyTypes = [
    { label: 'Breathing difficulty', desc: 'Severe asthma, choking, shortness of breath' },
    { label: 'Chest pain & Heart', desc: 'Suspected heart attack, angina, fainting' },
    { label: 'Injury / Accident', desc: 'Bleeding, fall, vehicle accident, fracture' },
    { label: 'Unconscious / Seizure', desc: 'Unresponsive patient or convulsion' },
    { label: 'Maternal & Delivery', desc: 'Labor contractions, pregnancy complication' },
    { label: 'Other Medical Crisis', desc: 'Severe allergic reaction, high fever' },
  ]

  const trigger = async () => {
    setError('')
    if (!emergencyType) {
      setError('Please select the type of emergency.')
      return
    }
    setSubmitting(true)
    const reason = [`Type: ${emergencyType}`, message.trim()].filter(Boolean).join('. ')
    const { data, error: err } = await supabase
      .from('sos_alerts')
      .insert({
        patient_id: user?.id || 'usr-patient-1',
        latitude: location?.lat ?? -33.9485,
        longitude: location?.lng ?? 18.5284,
        address_text: '14 Main Rd, Langa, Cape Town',
        message: reason || 'Urgent medical assistance requested.',
        status: 'active',
      })
      .select()
      .single()

    setSubmitting(false)
    if (err) setError(err.message)
    else {
      setAlert(data as SosAlert)
    }
  }

  const cancel = async () => {
    if (!alert) return
    await supabase.from('sos_alerts').update({ status: 'cancelled' }).eq('id', alert.id)
    setAlert(null)
  }

  // Active Alert Display
  if (alert) {
    const maps =
      alert.latitude && alert.longitude
        ? `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`
        : null

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-3xl bg-white border border-red-200 shadow-lg text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={44} />
          </div>

          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wider">
              Emergency SOS Active · Alert #{alert.id.slice(0, 8)}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-3">
              Emergency Dispatched Successfully
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              First responders at Cape Town EMS have received your coordinates and incident details.
              Stay calm, keep your phone line open, and remain in a safe location.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Incident Category:</span>
              <span className="font-semibold text-slate-900">{alert.message?.split('.')[0] || 'Medical Emergency'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recorded GPS Location:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Address Anchor:</span>
              <span className="font-semibold text-slate-900">14 Main Rd, Langa, Cape Town</span>
            </div>
          </div>

          {maps && (
            <div>
              <a
                href={maps}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-800 underline"
              >
                <Navigation size={14} />
                <span>Open location in Google Maps</span>
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href="tel:10177"
              className="py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Phone size={16} />
              <span>Call Dispatch (10177)</span>
            </a>
            <button
              onClick={cancel}
              className="py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              I am safe · Cancel alert
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner with Ambulance Visual Asset */}
      <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-6 sm:p-8 shadow-sm">
        <img
          src={ambulanceImg}
          alt="Emergency Medical Services Ambulance"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-red-950/70" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 text-white text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert size={14} />
              <span>Priority Medical Channel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Emergency SOS Dispatch</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-lg leading-relaxed">
              One tap transmits your telemetry to the nearest first responder unit and community clinic.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="tel:10177"
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs flex items-center gap-2 justify-center"
            >
              <Phone size={14} />
              <span>Ambulance: 10177</span>
            </a>
            <a
              href="tel:112"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-colors flex items-center gap-2 justify-center"
            >
              <Phone size={14} />
              <span>Cellular: 112</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main SOS Trigger Hub */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            1. Select Emergency Condition
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {emergencyTypes.map(type => (
              <button
                key={type.label}
                type="button"
                onClick={() => setEmergencyType(type.label)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  emergencyType === type.label
                    ? 'border-red-600 bg-red-50/70 text-red-950 ring-1 ring-red-500'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{type.label}</span>
                  {emergencyType === type.label && <CheckCircle2 size={16} className="text-red-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            2. Additional Clinical Context (Optional)
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Patient has difficulty breathing, sitting in the front room..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
          />
        </div>

        {/* Location Verification */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Dispatch Coordinates
            </span>
            <button
              type="button"
              onClick={captureLocation}
              className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Navigation size={12} />
              <span>Refresh GPS</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin size={16} className="text-red-600 shrink-0" />
              <span>14 Main Rd, Langa, Cape Town</span>
            </div>
            {location && (
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </span>
            )}
          </div>
          {locError && <p className="text-[11px] text-red-600 mt-1">{locError}</p>}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Giant Emergency Trigger Button */}
        <div className="pt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={trigger}
            disabled={submitting}
            className="w-full sm:w-80 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-base transition-all shadow-lg shadow-red-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 sos-pulse"
          >
            <AlertTriangle size={22} className="stroke-[2.5]" />
            <span>{submitting ? 'Transmitting Alert...' : 'DISPATCH EMERGENCY SOS'}</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Transmits high-priority alert to Cape Town First Responder network.
          </p>
        </div>
      </div>
    </div>
  )
}
