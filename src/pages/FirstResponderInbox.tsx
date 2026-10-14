import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { SosAlert } from '../lib/types'
import { AlertTriangle, MapPin, Phone, CheckCircle2 } from 'lucide-react'

const ACTIVE: SosAlert['status'][] = ['active', 'acknowledged']

export default function FirstResponderInbox() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<SosAlert[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('sos_alerts')
      .select('*, patient:profiles!sos_alerts_patient_id_fkey(*)')
      .in('status', ACTIVE)
      .order('created_at', { ascending: false })
    setAlerts((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase.channel('sos-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_alerts' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const acknowledge = async (id: string) => {
    await supabase.from('sos_alerts').update({
      status: 'acknowledged', responder_id: user!.id, acknowledged_at: new Date().toISOString(),
    }).eq('id', id)
    load()
  }

  const resolve = async (id: string) => {
    await supabase.from('sos_alerts').update({
      status: 'resolved', responder_id: user!.id, resolved_at: new Date().toISOString(),
      responder_notes: notes[id] || null,
    }).eq('id', id)
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-red-700 flex items-center gap-2">
        <AlertTriangle /> SOS Inbox
      </h1>
      <p className="text-sm text-slate-500">Live emergency alerts. Updates in real time.</p>
      {loading && <p className="text-slate-500">Loading…</p>}
      <div className="space-y-3">
        {alerts.map(a => {
          const maps = a.latitude && a.longitude ? `https://www.google.com/maps?q=${a.latitude},${a.longitude}` : null
          return (
            <div key={a.id} className={`rounded-2xl shadow p-4 space-y-2 ${a.status === 'active' ? 'bg-red-50 border-2 border-red-300' : 'bg-white'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.patient?.full_name ?? 'Unknown patient'}</h3>
                  <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {a.status}
                </span>
              </div>
              {a.message && <p className="text-sm text-slate-700">{a.message}</p>}
              {a.address_text && <p className="text-sm text-slate-500">{a.address_text}</p>}
              {maps && (
                <a href={maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-teal-700 underline">
                  <MapPin size={14} /> Open location
                </a>
              )}
              <textarea
                value={notes[a.id] ?? ''}
                onChange={e => setNotes(n => ({ ...n, [a.id]: e.target.value }))}
                placeholder="Responder notes"
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                {a.status === 'active' && (
                  <button onClick={() => acknowledge(a.id)}
                    className="flex-1 bg-amber-500 text-white rounded-lg py-2 text-sm font-medium">
                    Acknowledge
                  </button>
                )}
                <button onClick={() => resolve(a.id)}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} /> Resolve
                </button>
                {maps && (
                  <a href={`tel:`} className="px-3 border rounded-lg py-2 text-sm" aria-label="call">
                    <Phone size={14} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
        {alerts.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">No active alerts.</div>
        )}
      </div>
    </div>
  )
}
