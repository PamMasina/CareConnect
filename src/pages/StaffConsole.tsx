import { useAuth } from '../context/AuthContext'
import StaffAppointments from './StaffAppointments'
import QueueManage from './QueueManage'
import DoctorDashboard from './DoctorDashboard'
import NurseDashboard from './NurseDashboard'
import { useState } from 'react'

export default function StaffConsole() {
  const { profile } = useAuth()
  const role = profile?.role

  if (role === 'doctor') return <DoctorDashboard />
  if (role === 'nurse') return <NurseDashboard />

  const [tab, setTab] = useState<'appts' | 'queue'>('appts')
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('appts')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === 'appts' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          Appointments
        </button>
        <button onClick={() => setTab('queue')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === 'queue' ? 'bg-teal-600 text-white' : 'bg-white border'}`}>
          Live queue
        </button>
      </div>
      {tab === 'appts' ? <StaffAppointments /> : <QueueManage />}
    </div>
  )
}