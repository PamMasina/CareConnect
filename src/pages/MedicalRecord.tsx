import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import {
  FileText,
  Download,
  Stethoscope,
  AlertCircle,
  Pill,
  ShieldCheck,
  Calendar,
  Building2,
  Clock,
  Printer,
} from 'lucide-react'

export default function MedicalRecord() {
  const { user, profile } = useAuth()
  const [last, setLast] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('appointments')
      .select('*, service:services(*), clinic:profiles!appointments_doctor_id_fkey(*)')
      .eq('patient_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setLast((data as any)?.[0] ?? null)
        setLoading(false)
      })
  }, [user])

  const allergies = ['Penicillin', 'Sulphonamides (Mild)']
  const medications = [
    { name: 'Metformin 500mg', instructions: 'Twice daily with meals', doctor: 'Dr. S. Dlamini' },
    { name: 'Aspirin 75mg', instructions: 'Once daily in the morning', doctor: 'Dr. S. Dlamini' },
  ]

  const handleDownload = () => window.print()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
            <FileText size={14} />
            <span>Western Cape Patient Health Record</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Clinical Health Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified patient identifier: <span className="font-mono font-bold text-slate-800">A1234Z</span>
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer size={15} />
          <span>Print / Export Record</span>
        </button>
      </div>

      {/* Patient Demographic Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px] block">Full Name</span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{profile?.full_name || 'Thabo Mbeki'}</p>
        </div>
        {profile?.clinic && (
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">Primary Facility</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{profile.clinic}</p>
          </div>
        )}
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px] block">Contact Phone</span>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{profile?.phone || '+27 71 234 5678'}</p>
        </div>
        <div>
          <span className="text-slate-400 font-semibold uppercase text-[10px] block">Record Status</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-1">
            <ShieldCheck size={14} />
            <span>Active Verified</span>
          </span>
        </div>
      </div>

      {/* Recent Consultation Encounter */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Stethoscope size={18} className="text-teal-600" />
          <h2 className="font-bold text-base text-slate-900">Latest Clinic Consultation</h2>
        </div>

        {loading && <p className="text-xs text-slate-500">Loading consultation record…</p>}

        {!loading && !last && (
          <p className="text-xs text-slate-500">No previous consultation visits recorded.</p>
        )}

        {last && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Service Provided</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {last.service?.name ?? 'General Health Consultation'}
                </p>
                <p className="text-slate-500 text-[11px] mt-1">
                  Encounter Facility: {(last as any).clinic?.full_name ?? null}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Encounter Date & Time</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5 tabular-nums">
                  {new Date(last.scheduled_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {last.status.toUpperCase()}
                </span>
              </div>
            </div>

            {last.notes && (
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-teal-900 block">Attending Practitioner Notes:</span>
                <p className="leading-relaxed">{last.notes}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Allergies & Alerts */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <AlertCircle size={18} className="text-red-600" />
          <h2 className="font-bold text-base text-slate-900">Recorded Allergies & Adverse Reactions</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {allergies.map(a => (
            <span
              key={a}
              className="bg-red-50 text-red-800 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-xl"
            >
              ⚠ {a}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Notified to all attending practitioners and dispensing pharmacies across the Western Cape network.
        </p>
      </section>

      {/* Active Medications */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Pill size={18} className="text-teal-600" />
          <h2 className="font-bold text-base text-slate-900">Active Prescriptions & Chronic Medication</h2>
        </div>

        <div className="space-y-2.5">
          {medications.map(m => (
            <div
              key={m.name}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                <p className="text-slate-600 mt-0.5">{m.instructions}</p>
              </div>
              <span className="text-[11px] text-slate-400">Prescribing: {m.doctor}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}