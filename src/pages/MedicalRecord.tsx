import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import { FileText, Download, Stethoscope, AlertCircle, Pill } from 'lucide-react'

export default function MedicalRecord() {
  const { user } = useAuth()
  const [last, setLast] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('appointments')
      .select('*, service:services(*), clinic:profiles!appointments_doctor_id_fkey(*)')
      .eq('patient_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setLast((data as any)?.[0] ?? null)
        setLoading(false)
      })
  }, [user])

  const allergies = ['Penicillin']
  const medications = ['Metformin 500mg', 'Aspirin']

  const handleDownload = () => window.print()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Medical Record</h1>
        <button onClick={handleDownload}
          className="bg-teal-600 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1">
          <Download size={14} /> Download PDF
        </button>
      </div>
      <p className="text-sm text-slate-500">Patient ID: A1234Z</p>

      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><FileText size={16} /> Visit summary</h2>
        {loading && <p className="text-slate-500 text-sm">Loading…</p>}
        {!loading && !last && (
          <p className="text-slate-500 text-sm">No visits recorded yet.</p>
        )}
        {last && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Appointment</span>
              <span className="font-medium">{last.service?.name ?? 'General Consultation'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Clinic</span>
              <span className="font-medium">{(last as any).clinic?.full_name ?? 'Adriaanse Clinic'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium">{new Date(last.scheduled_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-medium capitalize">{last.status.replace('_',' ')}</span>
            </div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${last.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {last.status}
            </span>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow p-4 space-y-2">
        <h2 className="font-semibold flex items-center gap-2"><AlertCircle size={16} className="text-red-600" /> Allergies</h2>
        <div className="flex flex-wrap gap-2">
          {allergies.map(a => (
            <span key={a} className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full">{a}</span>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow p-4 space-y-2">
        <h2 className="font-semibold flex items-center gap-2"><Pill size={16} className="text-teal-700" /> Medication</h2>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {medications.map(m => <li key={m}>{m}</li>)}
        </ul>
      </section>

      {last?.notes && (
        <section className="bg-white rounded-2xl shadow p-4 space-y-2">
          <h2 className="font-semibold flex items-center gap-2"><Stethoscope size={16} /> Diagnostic notes</h2>
          <p className="text-sm text-slate-600">{last.notes}</p>
          <p className="text-xs text-slate-400">{new Date(last.scheduled_at).toLocaleDateString()}</p>
        </section>
      )}
    </div>
  )
}