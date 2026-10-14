import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'

export default function QueueStatus() {
  const { user } = useAuth()
  const [entry, setEntry] = useState<QueueEntry | null>(null)
  const [ahead, setAhead] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('queue_entries')
      .select('*')
      .eq('patient_id', user!.id)
      .in('status', ['waiting','called'])
      .order('checked_in_at', { ascending: false })
      .limit(1)
    const e = (data as QueueEntry[])?.[0] ?? null
    setEntry(e)
    if (e) {
      const { count } = await supabase.from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')
        .lt('checked_in_at', e.checked_in_at)
      setAhead(count ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <p className="text-slate-500">Loading…</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My queue status</h1>
      {!entry ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-slate-500">
          You are not checked in to the queue.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 space-y-3 text-center">
          <p className="text-sm text-slate-500">Status</p>
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
            {entry.status.replace('_',' ')}
          </span>
          <p className="text-4xl font-bold text-teal-700">{ahead}</p>
          <p className="text-sm text-slate-500">people ahead of you</p>
          <p className="text-xs text-slate-400">Checked in {new Date(entry.checked_in_at).toLocaleTimeString()}</p>
          <button onClick={load} className="mt-2 text-sm text-teal-600 underline">Refresh</button>
        </div>
      )}
    </div>
  )
}
