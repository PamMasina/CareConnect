import { useAuth } from '../context/AuthContext'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import DoctorDashboard from './DoctorDashboard'
import NurseDashboard from './NurseDashboard'
import { useState } from 'react'
import { ClipboardList, Users, Activity } from 'lucide-react'

export default function StaffConsole() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<'appts' | 'queue'>('appts')
  const role = profile?.role

  if (role === 'doctor') return <DoctorDashboard />
  if (role === 'nurse') return <NurseDashboard />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300 mb-2">
          <Activity size={13} />
          <span>Staff Healthcare Operations</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Clinical Staff Console</h1>
        <p className="text-xs text-slate-300 mt-1">
          {profile?.clinic || 'CareConnect'} · Live consultation roster & queue dispatch
        </p>
      </div>

      {/* Segmented Control */}
      <div className="p-1 rounded-2xl bg-slate-200/80 inline-flex w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setTab('appts')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'appts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList size={15} />
          <span>Appointments Schedule</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('queue')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            tab === 'queue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>Live Waiting Room</span>
        </button>
      </div>

      {tab === 'appts' ? <StaffAppointments /> : <QueueManage />}
    </div>
  )
}