import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Service } from '../lib/types'
import { CLINICS, type Clinic } from '../lib/clinics'
import { CalendarPlus, CheckCircle2, Search, ArrowLeft, ArrowRight } from 'lucide-react'

const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [serviceId, setServiceId] = useState('')
  const [doctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('services').select('*').eq('active', true).then(({ data }) => setServices((data as Service[]) ?? []))
  }, [])

  const filteredClinics = CLINICS.filter(c =>
    (c.name + ' ' + c.suburb + ' ' + c.address).toLowerCase().includes(query.toLowerCase())
  )

  const submit = async () => {
    setError('')
    if (!clinic || !serviceId || !date || !time) { setError('Please complete all steps.'); return }
    const scheduled = new Date(`${date}T${time}:00`).toISOString()
    setLoading(true)
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: user!.id,
      doctor_id: doctorId || null,
      service_id: serviceId,
      scheduled_at: scheduled,
      notes: clinic ? [notes, `Clinic: ${clinic.name}`].filter(Boolean).join(' · ') : (notes || null),
      status: 'booked',
    })
    setLoading(false)
    if (err) setError(err.message)
    else { setSuccess(true); setTimeout(() => navigate('/my-appointments'), 1200) }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center space-y-2">
        <CheckCircle2 className="mx-auto text-green-600" size={40} />
        <h2 className="font-bold text-lg">Successfully booked</h2>
        <p className="text-sm text-slate-500">Redirecting to your appointments…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="p-1"><ArrowLeft size={20} /></button>
          )}
          <h1 className="text-xl font-bold">Book an appointment</h1>
        </div>
        <p className="text-sm opacity-80">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="font-semibold text-sm text-slate-600">Select clinic</p>
          <div className="bg-white rounded-2xl shadow flex items-center gap-2 px-4 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clinic..." className="flex-1 outline-none text-sm" />
          </div>
          <div className="bg-white rounded-2xl shadow divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredClinics.map(c => (
              <button key={c.id} onClick={() => { setClinic(c); setStep(2) }}
                className="w-full text-left p-4 hover:bg-slate-50">
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-slate-500">{c.address} · {c.suburb}</p>
                <p className="text-xs text-slate-400">{c.openTime} – {c.closeTime}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="font-semibold text-sm text-slate-600">Select service</p>
          {clinic && <p className="text-sm text-slate-500">Clinic: {clinic.name}</p>}
          <div className="bg-white rounded-2xl shadow divide-y divide-slate-100">
            {services.map(s => (
              <button key={s.id} onClick={() => { setServiceId(s.id); setStep(3) }}
                className={`w-full text-left p-4 hover:bg-slate-50 flex items-center justify-between ${serviceId === s.id ? 'bg-teal-50' : ''}`}>
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-slate-400">{s.duration_minutes} min</span>
              </button>
            ))}
            {services.length === 0 && <p className="p-4 text-sm text-slate-500 text-center">No services available.</p>}
          </div>
          <button onClick={() => setStep(3)} disabled={!serviceId}
            className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="font-semibold text-sm text-slate-600">Pick a slot</p>
          {clinic && <p className="text-sm text-slate-500">Clinic: {clinic.name}</p>}
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().slice(0,10)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Time</label>
              <select value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="">...select...</option>
                {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional comments</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={() => { if (!date || !time) { setError('Please select date and time.'); return } setError(''); setStep(4) }}
            className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2">
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="font-semibold text-sm text-slate-600">Confirmation</p>
          <div className="bg-white rounded-2xl shadow p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Clinic</span><span className="font-medium">{clinic?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Service</span><span className="font-medium">{services.find(s => s.id === serviceId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{time}</span></div>
            {notes && <div className="flex justify-between"><span className="text-slate-500">Notes</span><span className="font-medium">{notes}</span></div>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button onClick={submit} disabled={loading}
            className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            <CalendarPlus size={18} /> {loading ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      )}
    </div>
  )
}