import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { QueueEntry } from '../lib/types'
import {
  Users,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export default function QueueStatus() {
  const { user, profile } = useAuth()
  const [entry, setEntry] = useState<QueueEntry | null>(null)
  const [ahead, setAhead] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('patient_id', user.id)
      .in('status', ['waiting', 'called', 'in_service'])
      .order('checked_in_at', { ascending: false })
      .limit(1)

    const e = (data as QueueEntry[])?.[0] ?? null
    setEntry(e)
    if (e) {
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')
        .lt('checked_in_at', e.checked_in_at)
      setAhead(count ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const clinicName = profile?.clinic ?? null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
            <Users size={14} />
            <span>Facility Waiting Room</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Live Queue Position
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {clinicName ? `${clinicName} · ` : ''}Western Cape Health
          </p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-teal-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh position"
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {!entry ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-4 shadow-xs">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Not Currently in Queue</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              You haven't checked into the waiting room today. Check in from your booked appointment or visit your local clinic reception.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/my-appointments"
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
            >
              View My Bookings
            </Link>
            <Link
              to="/clinics"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Find Nearby Clinic
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Status Capsule */}
          <div className="text-center space-y-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                entry.status === 'called'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse'
                  : entry.status === 'in_service'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {entry.status === 'called' ? '⚡ Called to Consultation' : entry.status.replace('_', ' ')}
            </span>

            <div className="py-4">
              <span className="text-6xl sm:text-7xl font-extrabold text-teal-800 tabular-nums tracking-tight">
                {ahead}
              </span>
              <p className="text-sm font-semibold text-slate-700 mt-2">
                {ahead === 0 ? 'You are next in line!' : 'Patients ahead of you'}
              </p>
            </div>

            <p className="text-xs text-slate-400">
              Checked in at{' '}
              <span className="tabular-nums font-semibold text-slate-600">
                {new Date(entry.checked_in_at).toLocaleTimeString()}
              </span>
            </p>
          </div>

          {/* Guidance Card */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2 text-xs text-teal-900">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 size={16} className="text-teal-700" />
              <span>Waiting Room Instructions</span>
            </div>
            <p className="leading-relaxed">
              Please remain near the clinic consultation waiting area. When your number is called,
              proceed to Consultation Room 4 and have your clinic card or ID ready.
            </p>
          </div>

          {/* Clinic Information */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Facility Station:</span>
              <span className="font-semibold text-slate-800">{clinicName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Consultation Time:</span>
              <span className="font-semibold text-slate-800">12 – 15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Turn:</span>
              <span className="font-semibold text-teal-800 tabular-nums">
                ~{Math.max(2, ahead * 12)} mins
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
