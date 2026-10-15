import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import { Users, ClipboardList } from 'lucide-react'

export default function DoctorDashboard() {
  const { profile, user } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic
  const [tab, setTab] = useState<'appts' | 'queue'>('appts')
  const [remaining, setRemaining] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  useEffect(() => {
    const load = async () => {
      const start = new Date(); start.setHours(0,0,0,0)
      const end = new Date(); end.setHours(23,59,59,999)
      const { data } = await supabase.from('appointments')
        .select('*').gte('scheduled_at', start.toISOString()).lte('scheduled_at', end.toISOString())
      const rows = (data as Appointment[]) ?? []
      setTodayCount(rows.length)
      setRemaining(rows.filter(r => r.status !== 'completed').length)
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-5 shadow-lg">
        <h1 className="text-xl font-bold">{profile?.full_name}</h1>
        <p className="text-sm opacity-80">{clinic || 'Your clinic'} · {new Date().toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short' })}</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-2xl font-bold">{remaining}</p>
            <p className="text-xs opacity-90">Remaining</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-2xl font-bold">{todayCount}</p>
            <p className="text-xs opacity-90">Today's patients</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('appts')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'appts' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          <ClipboardList size={14} /> Appointments
        </button>
        <button onClick={() => setTab('queue')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'queue' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          <Users size={14} /> Live queue
        </button>
      </div>
      {tab === 'appts' ? <StaffAppointments /> : <QueueManage />}
    </div>
  )
}