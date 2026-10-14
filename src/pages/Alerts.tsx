import { ArrowLeft, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Alerts() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Alerts</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500 space-y-2">
        <Bell className="mx-auto text-slate-400" />
        <p>No alerts right now.</p>
        <p className="text-xs">Emergency alerts will appear here when available.</p>
      </div>
    </div>
  )
}
