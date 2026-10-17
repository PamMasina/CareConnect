import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const INITIAL_ALERTS = [
  {
    id: 1,
    title: 'Severe Rainfall & Flash Flood Advisory',
    body: 'A weather warning for heavy rainfall and gale force winds has been issued across Cape Town and the Cape Peninsula. Residents in low-lying informal areas should take precautions.',
    date: '11 Oct 2026',
    category: 'Weather Warning',
    severity: 'high',
  },
  {
    id: 2,
    title: 'Seasonal Influenza (Flu) Surveillance Alert',
    body: 'Health officials urge vulnerable residents, elderly citizens, and parents of young children to receive annual influenza immunisations available free at local community clinics.',
    date: '10 Oct 2026',
    category: 'Public Health',
    severity: 'medium',
  },
  {
    id: 3,
    title: 'Community Heating & Fire Safety Guidance',
    body: 'Fire and Rescue Services remind residents to exercise extreme caution when using paraffin stoves or portable heaters. Keep heaters at least 1 meter away from flammable materials.',
    date: '08 Oct 2026',
    category: 'Fire Safety',
    severity: 'medium',
  },
  {
    id: 4,
    title: 'Scheduled Electrical Maintenance in Langa',
    body: 'Scheduled maintenance work will affect parts of the Langa CHC supply zone on Tuesday between 08:00 and 16:00. Facility backup generators will remain active.',
    date: '05 Oct 2026',
    category: 'Municipal Infrastructure',
    severity: 'low',
  },
]

export default function Alerts() {
  const navigate = useNavigate()
  const [alerts] = useState(INITIAL_ALERTS)
  const [allRead, setAllRead] = useState(false)

  const markAllRead = () => {
    setAllRead(true)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium mb-0.5">
              <ShieldAlert size={14} />
              <span>Public Health & Emergency Advisories</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              City Health Alerts
            </h1>
          </div>
        </div>

        <button
          onClick={markAllRead}
          disabled={allRead}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors self-start sm:self-auto disabled:opacity-40"
        >
          {allRead ? 'All marked as read' : 'Mark all as read'}
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.map(a => {
          const isHigh = a.severity === 'high'
          return (
            <div
              key={a.id}
              className={`p-6 rounded-3xl border transition-all shadow-xs space-y-3 ${
                isHigh
                  ? 'bg-red-50/50 border-red-200'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isHigh ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {a.category} · Issued {a.date}
                    </span>
                    <h2 className="font-bold text-base text-slate-900 mt-0.5">{a.title}</h2>
                  </div>
                </div>

                {isHigh && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase shrink-0">
                    Priority
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 pl-12 leading-relaxed">{a.body}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}