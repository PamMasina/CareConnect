import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Service, Profile } from '../lib/types'
import { CalendarPlus, CheckCircle2 } from 'lucide-react'

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const clinic = (location.state as { clinic?: { id: string; name: string; address: string; suburb: string } } | null)?.clinic
  const [services, setServices] = useState<Service[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  const [serviceId, setServiceId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('services').select('*').eq('active', true).then(({ data }) => setServices((data as Service[]) ?? []))
    supabase.from('profiles').select('*').eq('role', 'doctor').then(({ data }) => setDoctors((data as Profile[]) ?? []))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!serviceId || !date || !time) { setError('Please fill in service, date and time.'); return }
    const scheduled = new Date(`${date}T${time}:00`).toISOString()
    setLoading(true)
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: user!.id,
      doctor_id: doctorId || null,
      service_id: serviceId,
      scheduled_at: scheduled,
      notes: notes || null,
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
        <h2 className="font-bold text-lg">Appointment booked!</h2>
        <p className="text-sm text-slate-500">Redirecting to your appointments…</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Book an appointment</h1>
      {clinic && <p className="text-sm text-slate-500">Clinic: {clinic.name} · {clinic.suburb}</p>}
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Service</label>
          <select required value={serviceId} onChange={e => setServiceId(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2">
            <option value="">Select a service</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Doctor (optional)</label>
          <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2">
            <option value="">Any available doctor</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().slice(0,10)}
              className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Time</label>
            <input required type="time" value={time} onChange={e => setTime(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="mt-1 w-full border rounded-lg px-3 py-2" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-teal-600 text-white rounded-lg py-2.5 font-semibold hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
          <CalendarPlus size={18} /> {loading ? 'Booking…' : 'Book appointment'}
        </button>
      </form>
    </div>
  )
}
