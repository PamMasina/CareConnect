import { useEffect, useState } from 'react'

import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'

export default function QueueManage() {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('queue_entries')
      .select('*, patient:profiles!queue_entries_patient_id_fkey(*), appointment:appointments(*)')
      .in('status', ['waiting','called','in_service'])
      .order('checked_in_at')
    setEntries((data as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = async (id: string, status: QueueEntry['status']) => {
    await supabase.from('queue_entries').update({ status }).eq('id', id)
    if (status === 'done') {
      const entry = entries.find(e => e.id === id)
      if (entry?.appointment_id) await supabase.from('appointments').update({ status: 'completed' }).eq('id', entry.appointment_id)
    }
    load()
  }

  const callNext = async () => {
    const next = entries.find(e => e.status === 'waiting')
    if (next) await update(next.id, 'called')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Live queue</h1>
        <button onClick={callNext} className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Call next</button>
      </div>
      {loading && <p className="text-slate-500">Loading…</p>}
      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{e.patient?.full_name ?? 'Patient'}</h3>
                <p className="text-xs text-slate-500">Checked in {new Date(e.checked_in_at).toLocaleTimeString()}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">{e.status.replace('_',' ')}</span>
            </div>
            <div className="flex gap-2">
              {e.status === 'waiting' && (
                <button onClick={() => update(e.id, 'called')} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm">Call</button>
              )}
              {e.status === 'called' && (
                <button onClick={() => update(e.id, 'in_service')} className="flex-1 bg-purple-600 text-white rounded-lg py-2 text-sm">Start service</button>
              )}
              {e.status === 'in_service' && (
                <button onClick={() => update(e.id, 'done')} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm">Mark done</button>
              )}
              <button onClick={() => update(e.id, 'done')} className="px-3 border border-slate-300 rounded-lg py-2 text-sm">Skip</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">Queue is empty.</div>
        )}
      </div>
      <button onClick={load} className="w-full text-sm text-teal-600 underline">Refresh</button>
    </div>
  )
}
