import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import { XCircle, LogIn } from 'lucide-react'

export default function MyAppointments() {
  const { user } = useAuth()
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('appointments')
      .select('*, service:services(*), doctor:profiles!appointments_doctor_id_fkey(*)')
      .eq('patient_id', user!.id)
      .order('scheduled_at', { ascending: false })
    setItems((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const cancel = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    load()
  }

  const checkIn = async (appt: Appointment) => {
    await supabase.from('appointments').update({ status: 'checked_in' }).eq('id', appt.id)
    await supabase.from('queue_entries').insert({
      appointment_id: appt.id,
      patient_id: appt.patient_id,
      status: 'waiting',
    })
    load()
  }

  const statusColor: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-700',
    checked_in: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-500',
    no_show: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My appointments</h1>
      {loading && <p className="text-slate-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">No appointments yet.</div>
      )}
      <div className="space-y-3">
        {items.map(a => {
          const apptTime = new Date(a.scheduled_at)
          const canCheckIn = a.status === 'booked' && apptTime.toDateString() === new Date().toDateString()
          return (
            <div key={a.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.service?.name ?? 'Appointment'}</h3>
                  <p className="text-sm text-slate-500">
                    {apptTime.toLocaleString()} {a.doctor?.full_name ? `· Dr ${a.doctor.full_name}` : ''}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor[a.status]}`}>{a.status.replace('_',' ')}</span>
              </div>
              {a.notes && <p className="text-sm text-slate-600">{a.notes}</p>}
              <div className="flex gap-2">
                {canCheckIn && (
                  <button onClick={() => checkIn(a)}
                    className="flex-1 bg-teal-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1">
                    <LogIn size={14} /> Check in
                  </button>
                )}
                {(a.status === 'booked' || a.status === 'checked_in') && (
                  <button onClick={() => cancel(a.id)}
                    className="flex-1 border border-red-300 text-red-600 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1">
                    <XCircle size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
