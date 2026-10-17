import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { PatientMedicalRecord } from '../lib/types'
import { X, Plus, Trash2, Save, AlertCircle, Pill, FileText, HeartPulse, Loader2 } from 'lucide-react'

type Med = NonNullable<PatientMedicalRecord['medications']>[number]

interface Props {
  patientId: string
  patientName: string
  onClose: () => void
}

export function PatientRecordEditor({ patientId, patientName, onClose }: Props) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [exists, setExists] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [allergiesText, setAllergiesText] = useState('')
  const [conditionsText, setConditionsText] = useState('')
  const [meds, setMeds] = useState<Med[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data, error } = await supabase
        .from('patient_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle()
      if (!active) return
      if (error) setLoadError(error.message)
      const rec = (data as PatientMedicalRecord) ?? null
      if (rec) {
        setExists(true)
        setAllergiesText((rec.allergies ?? []).join(', '))
        setConditionsText((rec.chronic_conditions ?? []).join(', '))
        setMeds((rec.medications as Med[]) ?? [])
        setNotes(rec.medical_notes ?? '')
      } else {
        setExists(false)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [patientId])

  const addMed = () =>
    setMeds([
      ...meds,
      {
        name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        prescribed_by: profile?.full_name || undefined,
        prescribed_at: new Date().toISOString(),
      },
    ])

  const updateMed = (i: number, patch: Partial<Med>) =>
    setMeds(meds.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))

  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    const payload = {
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      chronic_conditions: conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      medications: meds.filter(m => m.name && m.name.trim()),
      medical_notes: notes.trim() ? notes.trim() : null,
      updated_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    }
    if (exists) {
      await supabase.from('patient_medical_records').update(payload).eq('patient_id', patientId)
    } else {
      await supabase.from('patient_medical_records').insert({ patient_id: patientId, ...payload })
      setExists(true)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm overflow-y-auto p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="mx-auto my-4 bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <FileText size={19} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 truncate">
                {patientName}
              </h2>
              <p className="text-[11px] text-slate-500">
                Patient ID: <span className="font-mono">{patientId.slice(0, 8).toUpperCase()}</span>
                {exists && <span className="text-emerald-600"> · existing record</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {loading && (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 size={15} className="animate-spin" />
              <span>Loading patient record…</span>
            </div>
          )}

          {!loading && loadError && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Could not load the saved record ({loadError}). You can still enter values and save.
            </p>
          )}

          {!loading && (
            <>
              {/* Allergies */}
              <section className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 uppercase tracking-wider">
                  <AlertCircle size={13} />
                  <span>Allergies & Adverse Reactions</span>
                </label>
                <input
                  value={allergiesText}
                  onChange={e => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Latex, Peanuts (separate with commas)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <p className="text-[10px] text-slate-400">
                  Shown prominently to all staff treating this patient.
                </p>
              </section>

              {/* Chronic conditions */}
              <section className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <HeartPulse size={13} />
                  <span>Chronic Conditions</span>
                </label>
                <input
                  value={conditionsText}
                  onChange={e => setConditionsText(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes Type 2 (separate with commas)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </section>

              {/* Medications */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <Pill size={13} />
                    <span>Prescriptions & Medication</span>
                  </label>
                  <button
                    type="button"
                    onClick={addMed}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-[11px] font-bold hover:bg-teal-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add medication</span>
                  </button>
                </div>

                {meds.length === 0 && (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                    No medications recorded.
                  </p>
                )}

                <div className="space-y-2.5">
                  {meds.map((m, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          value={m.name || ''}
                          onChange={e => updateMed(i, { name: e.target.value })}
                          placeholder="Medication name"
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeMed(i)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                          aria-label="Remove medication"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <input
                          value={m.dosage || ''}
                          onChange={e => updateMed(i, { dosage: e.target.value })}
                          placeholder="Dosage (e.g. 500mg)"
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <input
                          value={m.frequency || ''}
                          onChange={e => updateMed(i, { frequency: e.target.value })}
                          placeholder="Frequency (e.g. twice daily)"
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <input
                          value={m.instructions || ''}
                          onChange={e => updateMed(i, { instructions: e.target.value })}
                          placeholder="Instructions"
                          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      {m.prescribed_by && (
                        <p className="text-[10px] text-slate-400">
                          Prescribed by {m.prescribed_by}
                          {m.prescribed_at &&
                            ` · ${new Date(m.prescribed_at).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Notes */}
              <section className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Clinical Notes
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Diagnosis, observations, treatment plan, follow-up instructions…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              {saved ? (
                <span className="text-emerald-700 font-semibold">Record saved successfully.</span>
              ) : (
                <>Last saved by: {profile?.full_name || 'You'}</>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                <Save size={14} />
                <span>{saving ? 'Saving…' : 'Save record'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
