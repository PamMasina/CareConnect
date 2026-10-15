import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'
import { Users, PhoneForwarded, Play, CheckCircle2, RotateCw, Clock, ArrowRight } from 'lucide-react'

export default function QueueManage() {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('queue_entries')
      .select('*, patient:profiles!queue_entries_patient_id_fkey(*), appointment:appointments(*)')
      .in('status', ['waiting', 'called', 'in_service'])
      .order('checked_in_at')
    setEntries((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const update = async (id: string, status: QueueEntry['status']) => {
    await supabase.from('queue_entries').update({ status }).eq('id', id)
    if (status === 'done') {
      const entry = entries.find(e => e.id === id)
      if (entry?.appointment_id) {
        await supabase.from('appointments').update({ status: 'completed' }).eq('id', entry.appointment_id)
      }
    }
    load()
  }

  const callNext = async () => {
    const next = entries.find(e => e.status === 'waiting')
    if (next) await update(next.id, 'called')
  }

  const waitingCount = entries.filter(e => e.status === 'waiting').length

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Waiting Room Queue</h2>
          <p className="text-xs text-slate-500">
            <span className="font-bold text-teal-700 tabular-nums">{waitingCount}</span> patients currently waiting to be called
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={callNext}
            disabled={waitingCount === 0}
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
          >
            <PhoneForwarded size={14} />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <p className="text-xs">Updating queue board…</p>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-3">
        {entries.map((e, index) => {
          const statusColors: Record<string, string> = {
            waiting: 'bg-amber-50 text-amber-800 border-amber-200',
            called: 'bg-purple-50 text-purple-800 border-purple-200 font-bold animate-pulse',
            in_service: 'bg-teal-50 text-teal-800 border-teal-200',
          }

          return (
            <div
              key={e.id}
              className={`p-5 rounded-3xl border transition-all shadow-xs space-y-3 ${
                e.status === 'called'
                  ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-300'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center shrink-0 tabular-nums">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {e.patient?.full_name ?? 'Walk-in Patient'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>
                        Checked in at{' '}
                        <span className="tabular-nums font-medium text-slate-700">
                          {new Date(e.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      {e.appointment?.service_id && (
                        <>
                          <span>·</span>
                          <span>Routine Consult</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] px-3 py-1 rounded-full border self-start ${statusColors[e.status] || 'bg-slate-100 text-slate-700'}`}>
                  {e.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {e.status === 'waiting' && (
                  <button
                    type="button"
                    onClick={() => update(e.id, 'called')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PhoneForwarded size={13} />
                    <span>Call Patient</span>
                  </button>
                )}

                {e.status === 'called' && (
                  <button
                    type="button"
                    onClick={() => update(e.id, 'in_service')}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Play size={13} />
                    <span>Start Consultation</span>
                  </button>
                )}

                {e.status === 'in_service' && (
                  <button
                    type="button"
                    onClick={() => update(e.id, 'done')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Complete Consultation</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => update(e.id, 'done')}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                >
                  Dismiss / Skip
                </button>
              </div>
            </div>
          )
        })}

        {entries.length === 0 && !loading && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <Users size={32} className="mx-auto text-slate-300" />
            <h3 className="font-bold text-sm text-slate-800">Waiting Room is Clear</h3>
            <p className="text-xs text-slate-500">No patients currently queued for consultation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
