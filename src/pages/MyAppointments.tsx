import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  LogIn,
  AlertCircle,
  Building2,
} from 'lucide-react'

export default function MyAppointments() {
  const { user } = useAuth()
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const todayStr = useMemo(() => new Date().toDateString(), [])

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, service:services(*), doctor:profiles!appointments_doctor_id_fkey(*)')
      .eq('patient_id', user.id)
      .order('scheduled_at', { ascending: false })
    setItems((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

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
      position: 1,
    })
    load()
  }

  const statusStyles: Record<string, { label: string; badge: string }> = {
    booked: { label: 'Booked & Confirmed', badge: 'bg-teal-50 text-teal-800 border-teal-200' },
    checked_in: { label: 'Checked In / In Queue', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    in_progress: { label: 'In Consultation', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
    completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
    no_show: { label: 'No Show', badge: 'bg-red-50 text-red-700 border-red-200' },
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
            <Calendar size={14} />
            <span>Consultation Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Clinic Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View booking status, check into the live waiting room, or reschedule
          </p>
        </div>

        <Link
          to="/appointments"
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <CalendarPlus size={15} />
          <span>Book New Visit</span>
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm">Loading your appointment records…</p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">No Appointments Recorded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              You haven't scheduled any consultations yet. Choose your local clinic and pick a convenient arrival slot.
            </p>
          </div>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
          >
            <CalendarPlus size={15} />
            <span>Schedule your first consultation</span>
          </Link>
        </div>
      )}

      {/* Appointment Cards */}
      <div className="space-y-4">
        {items.map(appt => {
          const apptTime = new Date(appt.scheduled_at)
          const isToday = apptTime.toDateString() === todayStr
          const canCheckIn = (appt.status === 'booked' && isToday) || appt.status === 'booked'
          const style = statusStyles[appt.status] || {
            label: appt.status,
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
          }

          return (
            <div
              key={appt.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      {appt.service?.name || 'General Consultation'}
                    </h3>
                    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Clock size={13} className="text-teal-600" />
                      <span className="tabular-nums">
                        {apptTime.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {apptTime.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>

                    <span>·</span>

                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" />
                      <span>{appt.clinic ?? null}</span>
                    </span>

                    {appt.doctor?.full_name && (
                      <>
                        <span>·</span>
                        <span>Practitioner: Dr. {appt.doctor.full_name}</span>
                      </>
                    )}
                  </div>
                </div>

                {appt.queue_number && (
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Queue Ticket
                    </span>
                    <span className="font-extrabold text-base text-teal-800 tabular-nums">
                      #{appt.queue_number}
                    </span>
                  </div>
                )}
              </div>

              {appt.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">Notes:</span>
                  <p>{appt.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Appointment ID: <span className="font-mono text-[11px]">{appt.id.slice(0, 8)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {canCheckIn && (
                    <button
                      type="button"
                      onClick={() => checkIn(appt)}
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <LogIn size={14} />
                      <span>Check in to Waiting Room</span>
                    </button>
                  )}

                  {(appt.status === 'booked' || appt.status === 'checked_in') && (
                    <button
                      type="button"
                      onClick={() => cancel(appt.id)}
                      className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 font-medium text-xs hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
