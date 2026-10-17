import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SosAlert } from '../lib/types'
import {
  AlertTriangle,
  MapPin,
  Phone,
  CheckCircle2,
  Navigation,
  Clock,
  Radio,
  RotateCw,
} from 'lucide-react'

const ACTIVE: SosAlert['status'][] = ['active', 'acknowledged']

export default function FirstResponderInbox() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SosAlert[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sos_alerts')
      .select('*, patient:profiles!sos_alerts_patient_id_fkey(*)')
      .in('status', ACTIVE)
      .order('created_at', { ascending: false })
    setAlerts((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('sos-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const acknowledge = async (id: string) => {
    await supabase
      .from('sos_alerts')
      .update({
        status: 'acknowledged',
        responder_id: user?.id || 'usr-responder-1',
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)
    load()
  }

  const resolve = async (id: string) => {
    await supabase
      .from('sos_alerts')
      .update({
        status: 'resolved',
        responder_id: user?.id || 'usr-responder-1',
        resolved_at: new Date().toISOString(),
        responder_notes: notes[id] || null,
      })
      .eq('id', id)
    load()
  }

  return (
    <div className="space-y-6">
      {/* EMS Dispatch Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-red-700 font-bold mb-1">
            <Radio size={14} className="text-red-600 animate-pulse" />
            <span>Emergency Medical Services (EMS) Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Live SOS Emergency Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time emergency telemetry dispatched from patients across Cape Town
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
            {alerts.length} Active Dispatch{alerts.length === 1 ? '' : 'es'}
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <p className="text-xs">Connecting to emergency dispatch prober…</p>
        </div>
      )}

      {/* Emergency Alerts Feed */}
      <div className="space-y-4">
        {alerts.map(a => {
          const maps =
            a.latitude && a.longitude
              ? `https://www.google.com/maps?q=${a.latitude},${a.longitude}`
              : null
          const isPending = a.status === 'active'

          return (
            <div
              key={a.id}
              className={`rounded-3xl p-6 transition-all shadow-xs space-y-4 ${
                isPending
                  ? 'bg-red-50/70 border-2 border-red-300 ring-1 ring-red-400'
                  : 'bg-white border border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPending ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base text-slate-900">
                        {a.patient?.full_name ?? 'Emergency Patient'}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isPending ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock size={12} className="text-red-600" />
                        <span className="tabular-nums">
                          {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>

                      {a.patient?.phone && (
                        <>
                          <span>·</span>
                          <a
                            href={`tel:${a.patient.phone}`}
                            className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                          >
                            <Phone size={11} />
                            <span>{a.patient.phone}</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {maps && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-teal-800 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Navigation size={12} className="text-teal-600" />
                    <span>View Coordinates</span>
                  </a>
                )}
              </div>

              {/* Message & Address */}
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Patient Condition & Notes
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">{a.message}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-600">
                  <MapPin size={13} className="text-red-600 shrink-0" />
                  <span>{a.address_text || '14 Main Rd, Langa, Cape Town'}</span>
                  {a.latitude && (
                    <span className="font-mono text-slate-400 text-[11px] tabular-nums ml-1">
                      ({a.latitude.toFixed(4)}, {a.longitude?.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>

              {/* Triage / Resolution Input */}
              <div className="space-y-3 pt-1">
                <input
                  type="text"
                  placeholder="Record responder resolution notes (e.g. Unit 42 on scene, patient stabilized)..."
                  value={notes[a.id] ?? ''}
                  onChange={e => setNotes({ ...notes, [a.id]: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />

                <div className="flex flex-wrap gap-2">
                  {a.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => acknowledge(a.id)}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Radio size={13} />
                      <span>Acknowledge & Dispatch Unit</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => resolve(a.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Resolve Incident</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {alerts.length === 0 && !loading && (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900">All Emergencies Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active or unacknowledged emergency alerts currently logged in the EMS dispatch buffer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
