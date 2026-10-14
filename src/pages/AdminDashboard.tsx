import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Service } from '../lib/types'
import { ShieldCheck, Plus, ToggleLeft, ToggleRight } from 'lucide-react'

const ROLES = ['patient','doctor','nurse','first_responder','admin'] as const

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [p, s] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('services').select('*').order('name'),
    ])
    setProfiles((p.data as Profile[]) ?? [])
    setServices((s.data as Service[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  const addService = async () => {
    if (!newService.trim()) return
    await supabase.from('services').insert({ name: newService.trim(), active: true })
    setNewService('')
    load()
  }

  const toggleService = async (s: Service) => {
    await supabase.from('services').update({ active: !s.active }).eq('id', s.id)
    load()
  }

  if (loading) return <p className="text-slate-500">Loading…</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck /> Admin console</h1>

      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">Services</h2>
        <div className="flex gap-2">
          <input value={newService} onChange={e => setNewService(e.target.value)}
            placeholder="New service name" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
          <button onClick={addService} className="bg-teal-600 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
        <ul className="divide-y">
          {services.map(s => (
            <li key={s.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-slate-500">{s.duration_minutes} min · {s.active ? 'active' : 'inactive'}</p>
              </div>
              <button onClick={() => toggleService(s)}>
                {s.active ? <ToggleRight className="text-teal-600" /> : <ToggleLeft className="text-slate-400" />}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded-2xl shadow p-4 space-y-3">
        <h2 className="font-semibold">Users ({profiles.length})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {profiles.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-2 py-1">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{p.id.slice(0,8)}…</p>
              </div>
              <select value={p.role} onChange={e => changeRole(p.id, e.target.value)}
                className="border rounded-lg px-2 py-1 text-xs">
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
