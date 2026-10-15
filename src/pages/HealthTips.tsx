import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  HeartPulse,
  Droplets,
  Shield,
  Moon,
  Apple,
  Sparkles,
  CalendarPlus,
} from 'lucide-react'

const HEALTH_GUIDANCE = [
  {
    category: 'Daily Hydration & Wellness',
    icon: Droplets,
    title: 'Maintain Regular Clean Hydration',
    body: 'Drink at least 6–8 glasses of clean water daily, particularly during Cape Town summer heatwaves. Proper hydration reduces kidney load and stabilizes blood pressure.',
    tags: 'General Care · Hydration',
  },
  {
    category: 'Infection Prevention',
    icon: Shield,
    title: 'Hand Hygiene & Respiratory Etiquette',
    body: 'Wash hands with soap for at least 20 seconds after using public transport or visiting health facilities. Keep up to date with seasonal influenza vaccinations at your local CHC.',
    tags: 'Infection Control · Immunisation',
  },
  {
    category: 'Chronic Condition Management',
    icon: HeartPulse,
    title: 'Adhere Closely to Prescription Schedules',
    body: 'If managing hypertension or diabetes, take prescribed medication at the same time each day. Never skip or alter doses without consulting your attending doctor or clinic sister.',
    tags: 'Hypertension · Diabetes',
  },
  {
    category: 'Immune Recovery & Sleep',
    icon: Moon,
    title: 'Ensure 7–8 Hours of Restful Sleep',
    body: 'Adequate restorative sleep supports cellular repair and immune defense. Minimize screen exposure 1 hour prior to sleep and avoid caffeine in late afternoons.',
    tags: 'Recovery · Sleep Hygiene',
  },
  {
    category: 'Balanced Nutrition',
    icon: Apple,
    title: 'Incorporate Colorful Fresh Produce',
    body: 'Aim for half your plate to consist of seasonal local vegetables and fruit. Reduce excessive salt and processed sugars to protect cardiovascular health.',
    tags: 'Nutrition · Cardiovascular',
  },
]

export default function HealthTips() {
  const navigate = useNavigate()
  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
              <HeartPulse size={14} />
              <span>Preventive Healthcare & Advice</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Community Health Guidance
            </h1>
          </div>
        </div>

        <Link
          to="/appointments"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
        >
          <CalendarPlus size={14} />
          <span>Consult Doctor</span>
        </Link>
      </div>

      {/* Guidance Cards */}
      <div className="space-y-4">
        {HEALTH_GUIDANCE.map((tip, i) => {
          const Icon = tip.icon
          return (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    {tip.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{tip.tags}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{tip.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
