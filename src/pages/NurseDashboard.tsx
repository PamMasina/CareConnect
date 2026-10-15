import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import { Users, Stethoscope, Activity, HeartPulse } from 'lucide-react'

export default function NurseDashboard() {
  const { profile, user } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic || profile?.clinic || 'Langa CHC'
  const [tab, setTab] = useState<'queue' | 'appts'>('queue')
  const [waiting, setWaiting] = useState(0)
  const [checkedIn, setCheckedIn] = useState(0)

  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('queue_entries')
        .select('*')
        .in('status', ['waiting', 'called', 'in_service'])
      const rows = (data as QueueEntry[]) ?? []
      setWaiting(rows.filter(r => r.status === 'waiting').length)
      setCheckedIn(rows.length)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Nurse Triage Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-cyan-300 mb-2">
              <HeartPulse size={13} />
              <span>Nursing & Triage Station</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {profile?.full_name || 'Sister Nomvula Khumalo'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {clinic} · Triage Bay 1 · {dateLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-2xl font-extrabold text-amber-300 tabular-nums">{waiting}</p>
              <p className="text-[11px] text-slate-300">In Waiting Room</p>
            </div>
            <div className="p-3 px-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <p className="text-2xl font-extrabold text-white tabular-nums">{checkedIn}</p>
              <p className="text-[11px] text-slate-300">Checked In Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="p-1 rounded-2xl bg-slate-200/80 inline-flex w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setTab('queue')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'queue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Live Waiting Room ({waiting})</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('appts')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'appts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={15} />
          <span>Scheduled Appointments</span>
        </button>
      </div>

      {tab === 'queue' ? <QueueManage /> : <StaffAppointments />}
    </div>
  )
}