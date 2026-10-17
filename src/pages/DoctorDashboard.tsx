import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import { ClinicEmergencyAlerts } from '../components/ClinicEmergencyAlerts'
import { Users, ClipboardList, Stethoscope } from 'lucide-react'

export default function DoctorDashboard() {
  const { profile, user } = useAuth()
  const clinic = profile?.clinic || (user as any)?.user_metadata?.clinic || null
  const [tab, setTab] = useState<'appts' | 'queue'>('appts')
  const [remaining, setRemaining] = useState(0)
  const [todayCount, setTodayCount] = useState(0)

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }, [])

  useEffect(() => {
    const load = async () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
      const rows = (data as Appointment[]) ?? []
      setTodayCount(rows.length)
      setRemaining(rows.filter(r => r.status !== 'completed').length)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Clinician Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300 mb-2">
              <Stethoscope size={13} />
              <span>Attending Physician Duty Station</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {profile?.full_name || 'Dr. Sipho Dlamini'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {clinic && `${clinic} · `}Consultation Room 4 · {dateLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-2xl font-extrabold text-emerald-300 tabular-nums">{remaining}</p>
              <p className="text-[11px] text-slate-300">Remaining</p>
            </div>
            <div className="p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-2xl font-extrabold text-white tabular-nums">{todayCount}</p>
              <p className="text-[11px] text-slate-300">Today's Total</p>
            </div>
          </div>
        </div>
      </div>

      <ClinicEmergencyAlerts clinic={clinic} />

      {/* Tab Segmented Control */}
      <div className="p-1 rounded-2xl bg-slate-200/80 inline-flex w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setTab('appts')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'appts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList size={15} />
          <span>Appointments List ({todayCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('queue')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'queue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Live Waiting Room Queue</span>
        </button>
      </div>

      {tab === 'appts' ? <StaffAppointments /> : <QueueManage />}
    </div>
  )
}