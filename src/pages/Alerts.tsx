import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ALERTS = [
  { title: 'Heavy rainfall warning', body: 'The South African Weather Service has issued a weather warning for HEAVY RAINFALL expected in Cape Town over the weekend.', date: '11/05/2026' },
  { title: 'Flu cases rising', body: 'Health officials are asking Cape Town residents to be more careful after more FLU CASES were reported at clinics and hospitals across the city this week.', date: '15/05/2026' },
  { title: 'House fire safety', body: 'The City’s Fire and Rescue Service is asking residents to be careful when using heaters after several HOUSE FIRES were reported across Cape Town this winter.', date: '17/05/2026' },
  { title: 'Power outages in Langa', body: 'Residents in Langa are advised that unplanned POWER OUTAGES have been reported in parts of the area due to faults and maintenance work.', date: '21/05/2026' },
  { title: 'Water disruptions', body: 'Residents in Lansdowne are advised that WATER DISRUPTIONS may occur due to ongoing water leakage.', date: '13/05/2026' },
]

export default function Alerts() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Alerts</h1>
      </div>
      <div className="flex justify-end">
        <button className="text-xs text-teal-600 font-medium">Mark all as read</button>
      </div>
      <div className="space-y-3">
        {ALERTS.map((a, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 mt-0.5" size={18} />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{a.body}</p>
                <p className="text-xs text-slate-400 mt-2">Date issued: {a.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}