import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Service } from '../lib/types'
import {
  ShieldCheck,
  Plus,
  ToggleLeft,
  ToggleRight,
  Users,
  Settings,
} from 'lucide-react'

const ROLES = ['patient', 'doctor', 'nurse', 'first_responder', 'admin'] as const

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [newService, setNewService] = useState('')
  const [newServiceRole, setNewServiceRole] = useState<'doctor' | 'nurse'>('doctor')
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

  useEffect(() => {
    load()
  }, [])

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  const addService = async () => {
    if (!newService.trim()) return
    await supabase.from('services').insert({
      name: newService.trim(),
      description: 'Routine healthcare clinical service.',
      duration_minutes: 20,
      provider_role: newServiceRole,
      active: true,
    })
    setNewService('')
    setNewServiceRole('doctor')
    load()
  }

  const toggleService = async (s: Service) => {
    await supabase.from('services').update({ active: !s.active }).eq('id', s.id)
    load()
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300 mb-2">
            <ShieldCheck size={14} />
            <span>Health System Administration Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Facility & Role Governance
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage active clinical consultation services, user account permissions, and facility roles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
            <span className="text-xl font-extrabold text-white tabular-nums">{profiles.length}</span>
            <span className="text-[10px] text-slate-300 block">Total Users</span>
          </div>
          <div className="p-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
            <span className="text-xl font-extrabold text-emerald-300 tabular-nums">{services.length}</span>
            <span className="text-[10px] text-slate-300 block">Services</span>
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-slate-500">Updating administration records…</p>}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Services Configuration (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-teal-600" />
              <h2 className="font-bold text-base text-slate-900">Clinical Services</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{services.length} active</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              value={newService}
              onChange={e => setNewService(e.target.value)}
              placeholder="e.g. Pediatric Screening"
              className="flex-1 min-w-[160px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <select
              value={newServiceRole}
              onChange={e => setNewServiceRole(e.target.value as 'doctor' | 'nurse')}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
            </select>
            <button
              onClick={addService}
              className="px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-1 shrink-0"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {services.map(s => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-slate-900">{s.name}</h3>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${
                        s.provider_role === 'nurse'
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {s.provider_role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {s.duration_minutes} min duration ·{' '}
                    <span className={s.active ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                      {s.active ? 'Available' : 'Paused'}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleService(s)}
                  className="text-slate-400 hover:text-slate-600"
                  title="Toggle active"
                >
                  {s.active ? (
                    <ToggleRight size={28} className="text-teal-600" />
                  ) : (
                    <ToggleLeft size={28} className="text-slate-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* User Roles & Permissions (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-teal-600" />
              <h2 className="font-bold text-base text-slate-900">Registered Accounts & Roles</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{profiles.length} profiles</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {profiles.map(p => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-slate-900 truncate">{p.full_name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono text-slate-400">{p.id.slice(0, 8)}</span>
                    {p.clinic && (
                      <>
                        <span>·</span>
                        <span>{p.clinic}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400">Assigned:</span>
                  <select
                    value={p.role}
                    onChange={e => changeRole(p.id, e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
