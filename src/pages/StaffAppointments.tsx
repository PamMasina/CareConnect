import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import { Calendar, Clock, User, Save, RotateCw, CheckCircle2 } from 'lucide-react'

const STATUSES: Appointment['status'][] = [
  'booked',
  'checked_in',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
]

export default function StaffAppointments() {
  const { user, profile } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic
  const role = profile?.role
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const start = new Date(date + 'T00:00:00').toISOString()
    const end = new Date(date + 'T23:59:59').toISOString()
    const { data } = await supabase
      .from('appointments')
      .select(
        '*, service:services(*), patient:profiles!appointments_patient_id_fkey(*), doctor:profiles!appointments_doctor_id_fkey(*)',
      )
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .order('scheduled_at')
    let rows = (data as any) ?? []
    if (clinic) rows = rows.filter((a: any) => !a.notes || a.notes.includes(clinic))
    // Doctors only see doctor-provided services; nurses only see nurse-provided services.
    // Appointments without a linked service remain visible to both clinical roles.
    if (role === 'doctor' || role === 'nurse') {
      rows = rows.filter((a: any) => !a.service || a.service.provider_role === role)
    }
    setItems(rows)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [date, clinic])

  const updateStatus = async (id: string, status: Appointment['status']) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    if (status === 'checked_in') {
      const appt = items.find(a => a.id === id)
      if (appt) {
        await supabase
          .from('queue_entries')
          .insert({ appointment_id: id, patient_id: appt.patient_id, status: 'waiting', position: 1 })
      }
    }
    if (status === 'completed' || status === 'no_show' || status === 'cancelled') {
      await supabase.from('queue_entries').update({ status: 'done' }).eq('appointment_id', id)
    }
    load()
  }

  const saveNotes = async (id: string) => {
    setSavingId(id)
    await supabase
      .from('appointments')
      .update({ notes: notesDraft[id] ?? '' })
      .eq('id', id)
    setSavingId(null)
    load()
  }

  const statusStyles: Record<string, string> = {
    booked: 'bg-teal-50 text-teal-800 border-teal-200',
    checked_in: 'bg-amber-50 text-amber-800 border-amber-200',
    in_progress: 'bg-purple-50 text-purple-800 border-purple-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
    no_show: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-4">
      {/* Date Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Appointments Schedule</h2>
          <p className="text-xs text-slate-500">
            Caseload roster for <span className="font-semibold text-slate-800">{date}</span> · {items.length} scheduled visits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <p className="text-xs">Loading clinical consultations…</p>
        </div>
      )}

      {/* Appointment Cards */}
      <div className="space-y-3">
        {items.map(a => {
          const apptDate = new Date(a.scheduled_at)
          return (
            <div
              key={a.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      {a.patient?.full_name ?? 'Walk-in Patient'}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusStyles[a.status] || 'bg-slate-100 text-slate-700'}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">{a.service?.name || 'General Consultation'}</span>
                    {a.service?.provider_role && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          a.service.provider_role === 'nurse'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}
                      >
                        {a.service.provider_role}
                      </span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-slate-700 tabular-nums">
                      <Clock size={12} className="text-teal-600" />
                      <span>{apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    {a.doctor && (
                      <>
                        <span>·</span>
                        <span>Attending: Dr. {a.doctor.full_name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Update:</span>
                  <select
                    value={a.status}
                    onChange={e => updateStatus(a.id, e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clinical Notes Section */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Diagnostic & Encounter Notes
                </label>
                <textarea
                  value={notesDraft[a.id] ?? a.notes ?? ''}
                  onChange={e => setNotesDraft({ ...notesDraft, [a.id]: e.target.value })}
                  rows={2}
                  placeholder="Record patient observations, blood pressure, prescription or treatment plan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
                <button
                  type="button"
                  onClick={() => saveNotes(a.id)}
                  disabled={savingId === a.id}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>{savingId === a.id ? 'Saving…' : 'Save Clinical Notes'}</span>
                </button>
              </div>
            </div>
          )
        })}

        {items.length === 0 && !loading && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <Calendar size={32} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">No Consultations Scheduled</h3>
            <p className="text-xs text-slate-500">There are no appointments logged for {date}.</p>
          </div>
        )}
      </div>
    </div>
  )
}
