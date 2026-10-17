import { useEffect, useMemo, useState } from 'react'
import { supabase, createStaffAccount, deleteUserAccount } from '../lib/supabase'
import type { Profile, Service, Appointment, SosAlert } from '../lib/types'
import { CLINICS } from '../lib/clinics'
import {
  ShieldCheck,
  Plus,
  ToggleLeft,
  ToggleRight,
  Users,
  Settings,
  Calendar,
  Clock,
  AlertTriangle,
  Trash2,
  UserPlus,
  Stethoscope,
  HeartPulse,
  Building2,
  LayoutDashboard,
  Radio,
  CheckCircle2,
} from 'lucide-react'

const ROLES = ['patient', 'doctor', 'nurse', 'first_responder', 'admin'] as const
const CLINIC_NAMES = Array.from(new Set(CLINICS.map(c => c.name)))

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Resolve the clinic an appointment belongs to (the mock joins clinic to the doctor profile).
function apptClinic(a: Appointment): string {
  if (typeof a.clinic === 'string' && a.clinic) return a.clinic
  const doc = a.doctor as any
  if (doc?.clinic) return doc.clinic
  const m = a.notes?.match(/Clinic:\s*([^·]+)/)
  return m ? m[1].trim() : 'Unassigned'
}

const sosStyles: Record<string, string> = {
  active: 'bg-red-50 text-red-700 border-red-200',
  acknowledged: 'bg-amber-50 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'services' | 'users'>('overview')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([])
  const [date, setDate] = useState(todayKey())
  const [loading, setLoading] = useState(true)
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)

  // services form
  const [newService, setNewService] = useState('')
  const [newServiceRole, setNewServiceRole] = useState<'doctor' | 'nurse'>('doctor')

  // user provisioning form
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'nurse' as Profile['role'],
    clinic: CLINIC_NAMES[0] ?? '',
  })
  const [formError, setFormError] = useState('')
  const [formNotice, setFormNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [p, s, a, sos] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('services').select('*').order('name'),
      supabase
        .from('appointments')
        .select(
          '*, service:services(*), patient:profiles!appointments_patient_id_fkey(*), doctor:profiles!appointments_doctor_id_fkey(*)',
        )
        .order('scheduled_at'),
      supabase
        .from('sos_alerts')
        .select('*, patient:profiles!sos_alerts_patient_id_fkey(*)')
        .order('created_at', { ascending: false }),
    ])
    setProfiles((p.data as Profile[]) ?? [])
    setServices((s.data as Service[]) ?? [])
    setAppointments((a.data as Appointment[]) ?? [])
    setSosAlerts((sos.data as SosAlert[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const dayAppts = useMemo(
    () => appointments.filter(a => dayKey(a.scheduled_at) === date),
    [appointments, date],
  )

  const counts = useMemo(() => {
    const byRole = (r: Profile['role']) => profiles.filter(p => p.role === r).length
    return {
      total: profiles.length,
      patients: byRole('patient'),
      doctors: byRole('doctor'),
      nurses: byRole('nurse'),
      responders: byRole('first_responder'),
      activeEmergencies: sosAlerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length,
    }
  }, [profiles, sosAlerts])

  // Staff duty roster: which doctor / nurse is booked for the selected day.
  const clinicalStaff = useMemo(() => {
    return profiles
      .filter(p => p.role === 'doctor' || p.role === 'nurse')
      .map(p => {
        const appts =
          p.role === 'doctor'
            ? dayAppts
                .filter(a => a.doctor_id === p.id || (a.doctor as any)?.id === p.id)
                .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
            : dayAppts
                .filter(
                  a => a.service?.provider_role === 'nurse' && apptClinic(a) === (p.clinic || ''),
                )
                .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
        return { profile: p, count: appts.length, appts }
      })
      .sort((a, b) => b.count - a.count)
  }, [profiles, dayAppts])

  // Appointment load per clinic for the selected day.
  const clinicLoad = useMemo(() => {
    const map: Record<string, number> = {}
    dayAppts.forEach(a => {
      const c = apptClinic(a)
      map[c] = (map[c] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [dayAppts])

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  const changeClinic = async (id: string, clinic: string) => {
    await supabase.from('profiles').update({ clinic: clinic || null }).eq('id', id)
    load()
  }

  const removeUser = async (p: Profile) => {
    if (!window.confirm(`Remove ${p.full_name}'s account? This cannot be undone.`)) return
    const { error } = await deleteUserAccount(p.id)
    if (error) setFormError(error.message)
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

  const addUser = async () => {
    setFormError('')
    setFormNotice('')
    if (!newUser.full_name.trim() || !newUser.email.trim() || !newUser.password) {
      setFormError('Name, email and password are required.')
      return
    }
    if (newUser.password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }
    setSaving(true)
    const { error } = await createStaffAccount({
      full_name: newUser.full_name.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      role: newUser.role,
      clinic: newUser.role === 'admin' ? newUser.clinic : newUser.clinic || null,
    })
    setSaving(false)
    if (error) {
      setFormError(error.message)
      return
    }
    setFormNotice(`Account created for ${newUser.full_name.trim()}.`)
    setNewUser({ ...newUser, full_name: '', email: '', password: '' })
    load()
  }

  const responderName = (id: string | null) =>
    id ? profiles.find(p => p.id === id)?.full_name || 'Assigned responder' : null

  const tabs = [
    { id: 'overview' as const, label: 'Operations Overview', icon: LayoutDashboard },
    { id: 'services' as const, label: 'Clinical Services', icon: Settings },
    { id: 'users' as const, label: 'User Management', icon: Users },
  ]

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
            Facility Oversight & System Control
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitor clinical staffing, clinic activity and emergencies, and manage user accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
            <span className="text-xl font-extrabold text-white tabular-nums">{counts.total}</span>
            <span className="text-[10px] text-slate-300 block">Total Users</span>
          </div>
          <div className="p-3 px-4 rounded-2xl bg-white/10 border border-white/10 text-center">
            <span className="text-xl font-extrabold text-red-300 tabular-nums">
              {counts.activeEmergencies}
            </span>
            <span className="text-[10px] text-slate-300 block">Active SOS</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-1 rounded-2xl bg-slate-200/80 inline-flex w-full sm:w-auto flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                tab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {loading && <p className="text-xs text-slate-500">Updating administration records…</p>}

      {/* ================= OVERVIEW ================= */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: 'Patients', value: counts.patients, color: 'text-emerald-600' },
              { label: 'Doctors', value: counts.doctors, color: 'text-teal-600' },
              { label: 'Nurses', value: counts.nurses, color: 'text-cyan-600' },
              { label: 'Responders', value: counts.responders, color: 'text-amber-600' },
              { label: 'Visits Today', value: appointments.filter(a => dayKey(a.scheduled_at) === todayKey()).length, color: 'text-indigo-600' },
              { label: 'Active SOS', value: counts.activeEmergencies, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Date selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-teal-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Duty Roster & Clinic Activity</h2>
                <p className="text-xs text-slate-500">
                  {dayAppts.length} scheduled visits across {clinicLoad.length} facilities on {date}
                </p>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Duty Roster */}
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope size={18} className="text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Clinical Staff on Duty</h2>
              </div>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {clinicalStaff.map(({ profile: p, count, appts }) => {
                  const open = expandedStaff === p.id
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl bg-slate-50/70 border border-slate-200/70 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedStaff(open ? null : p.id)}
                        className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              p.role === 'doctor'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-cyan-100 text-cyan-700'
                            }`}
                          >
                            {p.role === 'doctor' ? <Stethoscope size={16} /> : <HeartPulse size={16} />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-slate-900 truncate">
                              {p.full_name}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {p.clinic || 'No clinic assigned'} · {p.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-extrabold text-slate-900 tabular-nums">
                            {count}
                          </p>
                          <p className="text-[10px] text-slate-500">visits</p>
                        </div>
                      </button>

                      {open && (
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-200/70 space-y-1.5">
                          {appts.length === 0 && (
                            <p className="text-[11px] text-slate-500 py-1.5 text-center">
                              No appointments booked for {date}.
                            </p>
                          )}
                          {appts.map(a => (
                            <div
                              key={a.id}
                              className="flex items-center justify-between gap-2 text-[11px] bg-white border border-slate-200/70 rounded-xl px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Clock size={12} className="text-teal-600 shrink-0" />
                                <span className="font-semibold text-slate-800 tabular-nums">
                                  {new Date(a.scheduled_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span className="text-slate-600 truncate">
                                  {a.patient?.full_name || 'Walk-in Patient'}
                                </span>
                              </div>
                              <span className="text-slate-400 shrink-0">{a.service?.name || 'Consultation'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                {clinicalStaff.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">No clinical staff registered.</p>
                )}
              </div>
            </section>

            {/* Clinic Load */}
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Appointments per Clinic</h2>
              </div>
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {clinicLoad.map(([name, count]) => {
                  const max = clinicLoad[0]?.[1] || 1
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate">{name}</span>
                        <span className="font-bold text-slate-900 tabular-nums">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {clinicLoad.length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No appointments scheduled for {date}.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Emergency Oversight */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-red-600" />
                <h2 className="font-bold text-base text-slate-900">Emergency Dispatch Oversight</h2>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                {counts.activeEmergencies} active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Every SOS raised by a patient, the clinic it was routed to, and whether a responder
              assisted.
            </p>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {sosAlerts.map(a => {
                const assisted = a.status === 'acknowledged' || a.status === 'resolved'
                const responder = responderName(a.responder_id)
                return (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle size={14} className="text-red-600 shrink-0" />
                        <h3 className="font-bold text-xs text-slate-900">
                          {a.patient?.full_name || 'Patient'}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            sosStyles[a.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {a.status}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            assisted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {assisted ? 'Assisted' : 'No assistance yet'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {a.message || 'Emergency assistance requested.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={11} className="text-teal-600" />
                          {a.clinic || 'Unrouted'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(a.created_at).toLocaleString([], {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {responder && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            {responder}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {sosAlerts.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">No emergency alerts recorded.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ================= SERVICES ================= */}
      {tab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-12 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Clinical Services</h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {services.filter(s => s.active).length} active
              </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
        </div>
      )}

      {/* ================= USERS ================= */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add user */}
          <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 self-start">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-teal-600" />
              <h2 className="font-bold text-base text-slate-900">Add User</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Full name
                </label>
                <input
                  value={newUser.full_name}
                  onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g. Dr. Lerato Mokoena"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="name@careconnect.local"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Temporary password
                </label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value as Profile['role'] })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium capitalize focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {r.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Clinic
                  </label>
                  <select
                    value={newUser.clinic}
                    onChange={e => setNewUser({ ...newUser, clinic: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {CLINIC_NAMES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {formError}
                </p>
              )}
              {formNotice && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  {formNotice}
                </p>
              )}

              <button
                onClick={addUser}
                disabled={saving}
                className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>{saving ? 'Creating…' : 'Create User Account'}</span>
              </button>
            </div>
          </section>

          {/* User list */}
          <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Registered Accounts</h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{profiles.length} profiles</span>
            </div>

            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {profiles.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-slate-900 truncate">{p.full_name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{p.id.slice(0, 8)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUser(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={p.role}
                      onChange={e => changeRole(p.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 capitalize focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={p.clinic || ''}
                      onChange={e => changeClinic(p.id, e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="">No clinic</option>
                      {CLINIC_NAMES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">No accounts registered.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
