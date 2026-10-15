import { ArrowLeft, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NEW_ITEMS = [
  { title: 'Reminder - Tomorrow', body: 'General Consultation at 12:00 on Monday 11 May 2026', time: '2 min ago', channel: 'In-App' },
]
const EARLIER = [
  { title: 'Appointment completed - 07 April 2026', body: 'Your appointment on 07 April 2026 was marked completed.', time: '07 April 2026', channel: 'In-App' },
]

export default function Notifications() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-teal-600 font-medium">Mark all as read</button>
      </div>
      <section className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">NEW</p>
        {NEW_ITEMS.map((n, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4 space-y-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm">{n.title}</h3>
              <Bell size={14} className="text-teal-700" />
            </div>
            <p className="text-sm text-slate-600">{n.body}</p>
            <p className="text-xs text-slate-400">{n.time} · {n.channel}</p>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <p className="text-xs font-semibold text-slate-500">EARLIER</p>
        {EARLIER.map((n, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4 space-y-1">
            <h3 className="font-semibold text-sm">{n.title}</h3>
            <p className="text-sm text-slate-600">{n.body}</p>
            <p className="text-xs text-slate-400">{n.time} · {n.channel}</p>
          </div>
        ))}
      </section>
    </div>
  )
}