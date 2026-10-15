import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TIPS = [
  'Drink water regularly and aim for 8 glasses a day.',
  'Wash your hands for at least 20 seconds to prevent infection.',
  'Get at least 7–8 hours of sleep to support recovery.',
  'Eat a balanced diet with fruits and vegetables daily.',
  'Stay up to date with vaccinations and routine check-ups.',
]

export default function HealthTips() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">Health Tips</h1>
      </div>
      <div className="space-y-3">
        {TIPS.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-4 text-sm text-slate-700">{t}</div>
        ))}
      </div>
    </div>
  )
}
