import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SosAlert } from '../lib/types'
import { AlertTriangle, MapPin, Clock, Radio, CheckCircle2, Navigation, Building2 } from 'lucide-react'

const ACTIVE: SosAlert['status'][] = ['active', 'acknowledged']

export function ClinicEmergencyAlerts({ clinic }: { clinic: string | null }) {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SosAlert[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!clinic) {
      setAlerts([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('sos_alerts')
      .select('*, patient:profiles!sos_alerts_patient_id_fkey(*)')
      .eq('clinic', clinic)
      .in('status', ACTIVE)
      .order('created_at', { ascending: false })
    setAlerts((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('clinic-sos-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, () => load())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinic])

  const acknowledge = async (id: string) => {
    await supabase
      .from('sos_alerts')
      .update({
        status: 'acknowledged',
        responder_id: user?.id || null,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)
    load()
  }

  if (!loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">No active emergency alerts</p>
          <p className="text-xs text-slate-500">
            {clinic ? `SOS cases nearest to ${clinic} will appear here.` : 'Assign a clinic to receive routed SOS alerts.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/60 p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-red-600 animate-pulse" />
          <h2 className="text-sm font-extrabold text-red-900 uppercase tracking-wider">
            Incoming Emergency Alerts
          </h2>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white">
          {alerts.length} incoming
        </span>
      </div>
      <p className="text-xs text-red-800 flex items-center gap-1.5">
        <Building2 size={13} className="shrink-0" />
        <span>Routed to <span className="font-semibold">{clinic}</span> — a patient nearby needs emergency assistance.</span>
      </p>

      <div className="space-y-2.5">
        {alerts.map(a => {
          const maps =
            a.latitude && a.longitude
              ? `https://www.google.com/maps?q=${a.latitude},${a.longitude}`
              : null
          const acknowledged = a.status === 'acknowledged'
          return (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-white border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {a.patient?.full_name || 'Walk-in Patient'}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      acknowledged
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                    }`}
                  >
                    {acknowledged ? 'Acknowledged' : 'Awaiting response'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{a.message || 'Emergency assistance requested.'}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {a.latitude && a.longitude && (
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <MapPin size={11} className="text-red-500" />
                      {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {maps && (
                  <a
                    href={maps}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <Navigation size={13} />
                    <span>Map</span>
                  </a>
                )}
                {!acknowledged && (
                  <button
                    type="button"
                    onClick={() => acknowledge(a.id)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
