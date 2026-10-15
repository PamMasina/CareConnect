import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import { Users, Stethoscope } from 'lucide-react'

export default function NurseDashboard() {
  const { profile, user } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic
  const [tab, setTab] = useState<'queue' | 'appts'>('queue')
  const [waiting, setWaiting] = useState(0)
  const [checkedIn, setCheckedIn] = useState(0)
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('queue_entries').select('*').in('status', ['waiting','called','in_service'])
      const rows = (data as QueueEntry[]) ?? []
      setWaiting(rows.filter(r => r.status === 'waiting').length)
      setCheckedIn(rows.length)
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
            <p className="text-2xl font-bold">{waiting}</p>
            <p className="text-xs opacity-90">Waiting</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <p className="text-2xl font-bold">{checkedIn}</p>
            <p className="text-xs opacity-90">Checked in</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('queue')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'queue' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          <Users size={14} /> Waiting room
        </button>
        <button onClick={() => setTab('appts')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 ${tab === 'appts' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          <Stethoscope size={14} /> Appointments
        </button>
      </div>
      {tab === 'queue' ? <QueueManage /> : <StaffAppointments />}
    </div>
  )
}