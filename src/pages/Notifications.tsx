import { ArrowLeft, Bell, CheckCircle2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const INITIAL_NEW = [
  {
    id: 1,
    title: 'Appointment Reminder - Tomorrow',
    body: 'General Consultation scheduled at 10:00 with Dr. Sipho Dlamini at Langa CHC.',
    time: '2 min ago',
    channel: 'In-App',
  },
]

const INITIAL_EARLIER = [
  {
    id: 2,
    title: 'Consultation Completed',
    body: 'Your medical visit has been logged into your personal medical record.',
    time: 'Yesterday',
    channel: 'SMS & In-App',
  },
  {
    id: 3,
    title: 'Prescription Renewal Reminder',
    body: 'Chronic medication refill available for collection at Langa CHC Pharmacy.',
    time: '3 days ago',
    channel: 'In-App',
  },
]

export default function Notifications() {
  const navigate = useNavigate()
  const [newItems, setNewItems] = useState(INITIAL_NEW)
  const [earlierItems, setEarlierItems] = useState(INITIAL_EARLIER)

  const markAllRead = () => {
    setEarlierItems([...newItems, ...earlierItems])
    setNewItems([])
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-0.5">
              <Bell size={14} />
              <span>Activity Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Notifications
            </h1>
          </div>
        </div>

        {newItems.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* New Section */}
      {newItems.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">New</span>
            <span className="text-[11px] text-teal-700 font-semibold">{newItems.length} unread</span>
          </div>

          {newItems.map(n => (
            <div
              key={n.id}
              className="bg-white rounded-3xl border border-teal-200 ring-1 ring-teal-200/50 p-5 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span>
                  <h2 className="font-bold text-sm text-slate-900">{n.title}</h2>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{n.channel}</span>
              </div>
              <p className="text-xs text-slate-600 pl-4 leading-relaxed">{n.body}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-4 pt-1">
                <Clock size={11} />
                <span>{n.time}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Earlier Section */}
      <section className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Earlier</p>
        {earlierItems.map(n => (
          <div
            key={n.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-sm text-slate-900">{n.title}</h2>
              <span className="text-[10px] text-slate-400 font-mono">{n.channel}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
              <Clock size={11} />
              <span>{n.time}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}