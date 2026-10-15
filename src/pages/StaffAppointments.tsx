import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'

const STATUSES: Appointment['status'][] = ['booked','checked_in','in_progress','completed','no_show','cancelled']

export default function StaffAppointments() {
  const { user } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const start = new Date(date + 'T00:00:00').toISOString()
    const end = new Date(date + 'T23:59:59').toISOString()
    const { data } = await supabase.from('appointments')
      .select('*, service:services(*), patient:profiles!appointments_patient_id_fkey(*), doctor:profiles!appointments_doctor_id_fkey(*)')
      .gte('scheduled_at', start).lte('scheduled_at', end)
      .order('scheduled_at')
    let rows = (data as any) ?? []
    if (clinic) rows = rows.filter((a: any) => !a.notes || a.notes.includes(clinic))
    setItems(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [date, clinic])

  const updateStatus = async (id: string, status: Appointment['status']) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    // keep queue in sync
    if (status === 'checked_in') {
      const appt = items.find(a => a.id === id)
      if (appt) await supabase.from('queue_entries').insert({ appointment_id: id, patient_id: appt.patient_id, status: 'waiting' })
    }
    if (status === 'completed' || status === 'no_show' || status === 'cancelled') {
      await supabase.from('queue_entries').update({ status: 'done' }).eq('appointment_id', id)
    }
    load()
  }

  const saveNotes = async (id: string) => {
    setSavingId(id)
    await supabase.from('appointments').update({ notes: notesDraft[id] ?? '' }).eq('id', id)
    setSavingId(null)
    load()
  }

  const statusColor: Record<string,string> = {
    booked: 'bg-blue-100 text-blue-700',
    checked_in: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-500',
    no_show: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Appointments</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm" />
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      <div className="space-y-3">
        {items.map(a => (
          <div key={a.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{a.patient?.full_name ?? 'Patient'}</h3>
                <p className="text-sm text-slate-500">{a.service?.name} · {new Date(a.scheduled_at).toLocaleTimeString()}</p>
                {a.doctor && <p className="text-xs text-slate-400">Dr {a.doctor.full_name}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[a.status]}`}>{a.status.replace('_',' ')}</span>
            </div>
            <select value={a.status} onChange={e => updateStatus(a.id, e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Medical record notes</label>
              <textarea
                value={notesDraft[a.id] ?? a.notes ?? ''}
                onChange={e => setNotesDraft(d => ({ ...d, [a.id]: e.target.value }))}
                rows={2}
                placeholder="Diagnostic notes, allergies context, medication..."
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <button onClick={() => saveNotes(a.id)} disabled={savingId === a.id}
                className="text-xs bg-teal-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-60">
                {savingId === a.id ? 'Saving…' : 'Save notes'}
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">No appointments on this day.</div>
        )}
      </div>
    </div>
  )
}
