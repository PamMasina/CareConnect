import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment, QueueEntry, SosAlert } from '../lib/types'
import { CLINICS } from '../lib/clinics'
import {
  CalendarPlus,
  MapPin,
  HeartPulse,
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  Activity,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  Search,
  ArrowRight,
  Check,
  Building2,
  Ambulance,
} from 'lucide-react'

// High-fidelity image assets
const clinicFacilityImg = '/src/assets/images/clinic_modern_facility_1792063765730.jpg'
const doctorPortraitImg = '/src/assets/images/digital_health_doctor_1792063765070.jpg'
const receptionImg = '/src/assets/images/hero_cape_health_1792062792706.jpg'

export default function Home() {
  const { session, profile, user } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role || 'patient'
  const clinic = profile?.clinic || 'Langa CHC'

  // Patient live state
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null)
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null)
  const [activeSosCount, setActiveSosCount] = useState(0)

  // Staff live metrics
  const [todayApptCount, setTodayApptCount] = useState(0)
  const [waitingQueueCount, setWaitingQueueCount] = useState(0)

  // Public search query
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      // 1. Appointments
      const { data: apptData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user.id)
        .in('status', ['booked', 'checked_in', 'in_progress'])
        .order('scheduled_at')

      const appts = (apptData as Appointment[]) || []
      setUpcomingCount(appts.length)
      setNextAppt(appts[0] || null)

      // 2. Active Queue for patient
      const { data: qData } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('patient_id', user.id)
        .in('status', ['waiting', 'called', 'in_service'])
        .limit(1)

      const qRows = (qData as QueueEntry[]) || []
      setQueueEntry(qRows[0] || null)

      // 3. SOS Count
      const { data: sosData } = await supabase
        .from('sos_alerts')
        .select('*')
        .in('status', ['active', 'acknowledged'])

      const sosRows = (sosData as SosAlert[]) || []
      setActiveSosCount(sosRows.length)

      // 4. Staff metrics
      const { data: allAppts } = await supabase.from('appointments').select('*')
      const allApptRows = (allAppts as Appointment[]) || []
      setTodayApptCount(allApptRows.length)

      const { data: allQueue } = await supabase
        .from('queue_entries')
        .select('*')
        .in('status', ['waiting', 'called'])
      const allQRows = (allQueue as QueueEntry[]) || []
      setWaitingQueueCount(allQRows.length)
    }

    loadData()
  }, [user])

  // Filtered clinic search preview
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return CLINICS.filter(
      c => c.name.toLowerCase().includes(q) || c.suburb.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    ).slice(0, 4)
  }, [searchQuery])

  // =========================================================================
  // AUTHENTICATED STAFF VIEW (Doctor, Nurse, Paramedic, Admin)
  // =========================================================================
  if (session && role !== 'patient') {
    return (
      <div className="space-y-8">
        {/* Staff Hero Banner */}
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-8 sm:p-10 shadow-sm border border-slate-800">
          <img
            src={receptionImg}
            alt="Cape Town Clinic Facility"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-teal-950/80" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 mb-3 border border-white/10">
                <Activity size={14} />
                <span>Duty Station · {clinic}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Clinical Workspace: {profile?.full_name}
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Active clinical officer for Western Cape Public Health. Manage patient consultations, triage the live waiting room, or dispatch emergency rescue units.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/staff"
                className="px-5 py-3 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors shadow-sm flex items-center gap-2"
              >
                <Activity size={16} />
                <span>Open Staff Console</span>
              </Link>
              <Link
                to="/sos-inbox"
                className="px-5 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors shadow-sm flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                <span>EMS Inbox ({activeSosCount})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time Duty Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Scheduled Today</span>
              <CalendarPlus size={18} className="text-teal-600" />
            </div>
            <p className="text-4xl font-extrabold text-slate-900 tabular-nums">{todayApptCount}</p>
            <p className="text-xs text-slate-500 mt-1">Booked patient consultations</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Waiting Room</span>
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-4xl font-extrabold text-blue-700 tabular-nums">{waitingQueueCount}</p>
            <p className="text-xs text-slate-500 mt-1">Patients checked in on queue</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active SOS Dispatches</span>
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <p className="text-4xl font-extrabold text-red-600 tabular-nums">{activeSosCount}</p>
            <p className="text-xs text-slate-500 mt-1">Live emergency incidents</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Facility Operations</span>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-2">Active & Nominal</p>
            <p className="text-xs text-slate-500 mt-1">All primary triage lanes open</p>
          </div>
        </div>

        {/* Operational Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/staff"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Stethoscope size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Clinical Queue & Consultations</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Review waiting patient tickets, call the next patient into consultation, review history, and record clinical prescriptions.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-teal-700 group-hover:text-teal-800">
              <span>Open clinical console</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/sos-inbox"
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-red-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <AlertTriangle size={24} />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">EMS Emergency Dispatch</h3>
                {activeSosCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {activeSosCount} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Live distress signals with exact GPS coordinates, medical history, immediate dispatch confirmation, and responder routing.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-red-700 group-hover:text-red-800">
              <span>View live dispatch signals</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to={role === 'admin' ? '/admin' : '/clinics'}
            className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">
                {role === 'admin' ? 'System Administration' : 'Cape Town Clinic Facilities'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {role === 'admin'
                  ? 'Configure healthcare service catalogs, staff assignments, clinic operating hours, and security permissions.'
                  : 'Browse 20+ Cape Town CHCs, operational status, triage capacity, and facility contacts.'}
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-slate-700 group-hover:text-slate-900">
              <span>{role === 'admin' ? 'Open admin controls' : 'Browse facilities'}</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    )
  }

  // =========================================================================
  // AUTHENTICATED PATIENT VIEW
  // =========================================================================
  if (session && role === 'patient') {
    return (
      <div className="space-y-8">
        {/* Patient Welcoming Banner */}
        <div className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-6 sm:p-10 shadow-sm border border-slate-800">
          <img
            src={receptionImg}
            alt="Cape Town Clinic Reception"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-teal-950/80" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 mb-3 border border-white/15">
              <Activity size={13} className="text-emerald-400" />
              <span>Western Cape CareConnect · Patient Health Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hello, {profile?.full_name?.split(' ')[0] || 'Member'}
            </h1>
            <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
              Your registered clinic is <strong className="text-white">{clinic}</strong>. Schedule visits without 5:00 AM waiting lines, track your real-time queue position, and access 24/7 emergency dispatch.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/appointments"
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                <CalendarPlus size={16} />
                <span>Book New Visit</span>
              </Link>
              <Link
                to="/queue"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Users size={16} />
                <span>Live Queue Status</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Urgent Emergency Quick Trigger Bar */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">Need urgent medical assistance?</h3>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-red-700 uppercase">
                  24/7 SOS
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Press the SOS button to broadcast your precise GPS coordinates directly to Western Cape EMS dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/emergency"
              className="px-4 py-2.5 rounded-xl bg-white text-red-700 text-xs font-bold hover:bg-red-50 transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Trigger SOS</span>
              <ChevronRight size={14} />
            </Link>
            <a
              href="tel:10177"
              className="px-3.5 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-800 text-white text-xs font-semibold border border-red-500/40 transition-colors flex items-center gap-1.5"
            >
              <PhoneCall size={14} />
              <span>Call 10177</span>
            </a>
          </div>
        </div>

        {/* Patient Active Visit / Queue Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Scheduled Appointment */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarPlus size={18} className="text-teal-600" />
                <h2 className="font-bold text-base text-slate-900">Your Next Appointment</h2>
              </div>
              {upcomingCount > 1 && (
                <Link to="/my-appointments" className="text-xs text-teal-700 font-semibold hover:underline">
                  View all ({upcomingCount}) ›
                </Link>
              )}
            </div>

            {nextAppt ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {nextAppt.service?.name || 'General Health Consultation'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{nextAppt.clinic || clinic}</span>
                      <span>·</span>
                      <span>Room 4 (Primary Care)</span>
                    </div>
                  </div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-100 text-teal-800">
                    Confirmed · {nextAppt.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Clock size={15} className="text-teal-600" />
                    <span>
                      {new Date(nextAppt.scheduled_at).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums font-bold">
                      {new Date(nextAppt.scheduled_at).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/my-appointments"
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors"
                    >
                      Manage
                    </Link>
                    <Link
                      to="/queue"
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors"
                    >
                      Check-in status
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 space-y-3">
                <p className="text-sm">You have no upcoming clinic consultations scheduled.</p>
                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <CalendarPlus size={15} />
                  <span>Schedule your next consultation</span>
                </Link>
              </div>
            )}
          </div>

          {/* Live Queue Insight Box */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Users size={18} className="text-blue-600" />
                  <span>Live Clinic Queue</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Live
                </span>
              </div>

              {queueEntry ? (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-2">
                  <p className="text-xs text-blue-900 font-medium">You are in queue at {clinic}</p>
                  <p className="text-4xl font-extrabold text-blue-800 tabular-nums">
                    #{queueEntry.position || '1'}
                  </p>
                  <p className="text-xs text-blue-700">Estimated wait: ~12 minutes</p>
                  <Link
                    to="/queue"
                    className="mt-2 inline-block text-xs font-bold text-blue-800 underline hover:text-blue-900"
                  >
                    Track live status ›
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-600">
                  <p className="text-slate-500">
                    When you arrive at the clinic, check in to monitor your token live on your phone.
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Average Wait:</span>
                      <span className="font-semibold text-slate-800 tabular-nums">~18 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Attending Doctors:</span>
                      <span className="font-semibold text-slate-800">3 on duty</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pharmacy Collection:</span>
                      <span className="font-semibold text-emerald-700">Nominal (&lt; 10 min)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100">
              <Link
                to="/queue"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center justify-between"
              >
                <span>View waiting room monitor</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Healthcare Services Grid */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Patient Health Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/appointments"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <CalendarPlus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Book Visit</h3>
                <p className="text-xs text-slate-500 mt-1">Select date, time & clinic</p>
              </div>
            </Link>

            <Link
              to="/clinics"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Nearby Clinics</h3>
                <p className="text-xs text-slate-500 mt-1">20+ Cape Town CHCs</p>
              </div>
            </Link>

            <Link
              to="/health-tips"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Health Guides</h3>
                <p className="text-xs text-slate-500 mt-1">Maternal & chronic wellness</p>
              </div>
            </Link>

            <Link
              to="/alerts"
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-500 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Health Alerts</h3>
                <p className="text-xs text-slate-500 mt-1">Water, flu & seasonal notices</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // PUBLIC WEBSITE HOMEPAGE (UNAUTHENTICATED VISITORS)
  // High-impact, appealing, proper medical website presentation
  // =========================================================================
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* =========================================================================
          1. HERO SECTION: Split layout with architectural imagery & fast search
         ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 sm:pt-6">
        {/* Left Column: Proposition & Call to Action */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Western Cape Department of Health Partner Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] text-balance">
            Dignified Healthcare Access for Every Cape Town Resident.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Skip the 5:00 AM clinic queues. Schedule appointments online, monitor your live waiting token from your mobile phone, and summon emergency responders with one tap.
          </p>

          {/* Interactive Quick Clinic Search */}
          <div className="relative max-w-xl">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clinics by township (e.g. Langa, Khayelitsha, Mitchells Plain)..."
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
              />
              <Link
                to={searchQuery ? `/clinics?search=${encodeURIComponent(searchQuery)}` : '/clinics'}
                className="absolute right-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Find
              </Link>
            </div>

            {/* Live Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1 animate-in fade-in duration-100">
                <p className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Matching Clinics
                </p>
                {searchResults.map(c => (
                  <Link
                    key={c.id}
                    to="/clinics"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.suburb} · {c.address}</p>
                    </div>
                    <span className="text-teal-700 font-semibold text-[11px] flex items-center gap-1">
                      <span>View details</span>
                      <ChevronRight size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <CalendarPlus size={18} />
              <span>Book Consultation Online</span>
            </Link>

            <Link
              to="/queue"
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Users size={18} className="text-blue-600" />
              <span>Track Live Queue</span>
            </Link>

            <Link
              to="/emergency"
              className="px-5 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <AlertTriangle size={18} className="text-red-600" />
              <span>24/7 SOS Emergency</span>
            </Link>
          </div>

          {/* Trust markers */}
          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>100% Free Primary Care</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>No 5am Queues Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Western Cape EMS Dispatch</span>
            </div>
          </div>
        </div>

        {/* Right Column: High-Fidelity Architectural Photography */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 aspect-4/3 lg:aspect-3/4">
            <img
              src={clinicFacilityImg}
              alt="Table Bay Community Health Centre Cape Town"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Bottom Photo Overlay Tag */}
            <div className="absolute bottom-5 inset-x-5 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
                <MapPin size={12} className="text-emerald-300" />
                <span>Table Bay Community Health Centre</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Modern Facilities. Compassionate Care.
              </h4>
              <p className="text-xs text-slate-200 mt-0.5">
                Connecting 20+ public clinics with digital triage, electronic queueing, and dispatch.
              </p>
            </div>
          </div>

          {/* Floating Pill: Network Active Status */}
          <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">22 Facilities Connected</p>
              <p className="text-[11px] text-slate-500">Live queue transparency online</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE NETWORK PULSE STRIP (Tabular Metrics)
         ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="pt-4 lg:pt-0 lg:px-4 first:pt-0 first:px-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Public Facilities</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums mt-1">22</p>
            <p className="text-xs text-slate-500 mt-1">CHCs & Community Day Centres</p>
          </div>

          <div className="pt-4 lg:pt-0 lg:px-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Queue Wait</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-700 tabular-nums mt-1">18 min</p>
            <p className="text-xs text-slate-500 mt-1">Reduced from 4+ hours via online check-in</p>
          </div>

          <div className="pt-4 lg:pt-0 lg:px-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">EMS Ambulance Speed</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-red-600 tabular-nums mt-1">8.4 min</p>
            <p className="text-xs text-slate-500 mt-1">Average emergency response dispatch</p>
          </div>

          <div className="pt-4 lg:pt-0 lg:px-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Cost</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tabular-nums mt-1">R 0.00</p>
            <p className="text-xs text-slate-500 mt-1">100% Free primary health services</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CORE CAPABILITIES BENTO GRID
         ========================================================================= */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Modern Public Health
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 text-balance">
            Healthcare designed around community dignity.
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            CareConnect replaces crowded physical queues with intelligent digital triage, instant appointments, and direct emergency response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Online Booking (Span 2) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6">
                <CalendarPlus size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                01. Book Consultations in 60 Seconds
              </h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-xl">
                Choose your township clinic (Langa, Khayelitsha, Gugulethu, Mitchells Plain, Cape Town CBD), select your clinical stream (General Doctor, Maternal Health, Child Immunization, Chronic Care, Dental), and secure your time slot.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check size={16} className="text-teal-600 shrink-0" />
                  <span>Choose your preferred healthcare facility</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check size={16} className="text-teal-600 shrink-0" />
                  <span>Morning & afternoon consultation slots</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check size={16} className="text-teal-600 shrink-0" />
                  <span>Instant SMS and web confirmation</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Check size={16} className="text-teal-600 shrink-0" />
                  <span>Reschedule or cancel with zero penalty</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/appointments"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5"
              >
                <span>Schedule a clinic visit</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Live Queue Tracking (Span 1) */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                02. Real-Time Virtual Queue
              </h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                Check in from home or upon arrival. Receive an electronic token number and track how many patients are ahead of you in real-time.
              </p>

              {/* Simulated Queue Badge */}
              <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                  Simulated Live Token
                </span>
                <span className="text-3xl font-extrabold text-blue-800 tabular-nums block mt-1">
                  #A-14
                </span>
                <span className="text-xs text-blue-700 block mt-0.5">
                  2 patients ahead · Consult Room 3
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link
                to="/queue"
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Track live queue monitor</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: 24/7 GPS Emergency SOS (Span 1) */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <AlertTriangle size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                03. One-Tap Emergency SOS
              </h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                In trauma, cardiac, or maternal emergencies, one tap broadcasts your exact GPS location to Western Cape EMS dispatch with medical alert tags.
              </p>

              <div className="mt-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Ambulance size={14} />
                  <span>Integrated Toll-Free Hotlines</span>
                </p>
                <p className="text-[11px] text-red-700">Ambulance: 10177 · Cellphone: 112</p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link
                to="/emergency"
                className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1.5"
              >
                <span>Access emergency system</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bento Card 4: Health Records & Chronic Scripts (Span 2) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
                <Activity size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                04. Digital Chronic Care & Repeat Scripts
              </h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed max-w-xl">
                Maintain your medical records securely. View previous blood pressure readings, diabetes blood sugar checks, vaccination history, and request chronic medication pre-packing for fast pharmacy collection.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-900">Chronic Refills</p>
                  <p className="text-[11px] text-slate-500 mt-1">Pre-packed medication pickup with zero wait</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-900">Vitals Tracking</p>
                  <p className="text-[11px] text-slate-500 mt-1">Logged blood pressure, pulse, and BMI</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-900">POPIA Privacy</p>
                  <p className="text-[11px] text-slate-500 mt-1">Strict health data encryption</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link
                to="/medical-record"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <span>View health records</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CLINICAL DOCTOR SPOTLIGHT
         ========================================================================= */}
      <section className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 shadow-md border border-slate-200">
              <img
                src={doctorPortraitImg}
                alt="South African Medical Doctor at CareConnect Clinic"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <Stethoscope size={16} />
              <span>Physician's Perspective</span>
            </div>

            <blockquote className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
              “Before CareConnect, elderly mothers and chronic patients stood outside our clinic doors at 4:30 AM in the freezing rain. With digital appointments and live queue tokens, patients arrive right when their doctor is ready. It has restored dignity to community public healthcare.”
            </blockquote>

            <div className="pt-2">
              <p className="font-bold text-slate-900 text-base">Dr. Sipho Dlamini, MBChB</p>
              <p className="text-xs text-slate-500">
                Clinical Head of Primary Healthcare · Langa Community Health Centre · Metro District Health Services
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURED CLINICS DIRECTORY PREVIEW
         ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Community Health Centres
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Find Care Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              20+ verified Western Cape Community Health Centres with real-time status.
            </p>
          </div>

          <Link
            to="/clinics"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 shrink-0"
          >
            <span>View all 20 facilities</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CLINICS.slice(0, 4).map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-teal-400 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-900">{c.suburb}</span>
                  <span className="text-[11px] text-teal-700 font-semibold tabular-nums">{c.distance}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{c.address}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock size={13} className="text-slate-400" />
                  <span>{c.openTime} – {c.closeTime}</span>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${c.phone}`}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <PhoneCall size={12} />
                  <span>Call</span>
                </a>
                <Link
                  to="/appointments"
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Book visit ›
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. PUBLIC HEALTH ADVISORIES PREVIEW
         ========================================================================= */}
      <section className="p-8 rounded-3xl bg-slate-900 text-white shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Bell size={14} />
              <span>Official Public Health Bulletins</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              City of Cape Town Health Advisories
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active guidance from the Western Cape Disease Surveillance Unit.
            </p>
          </div>

          <Link
            to="/alerts"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0"
          >
            <span>View all active bulletins</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
              Seasonal Notice
            </span>
            <h4 className="font-bold text-white text-base mt-2.5">
              Summer Heat & Dehydration Advisory
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Stay hydrated during peak noon hours. Watch for early lethargy in infants and seniors. Free rehydration packs available at all CHCs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase">
              Immunization
            </span>
            <h4 className="font-bold text-white text-base mt-2.5">
              Childhood Measles & Polio Catch-Up
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Bring Road to Health cards. Free nurse-administered immunizations without appointment needed at all maternal child units.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
              Sanitation
            </span>
            <h4 className="font-bold text-white text-base mt-2.5">
              Safe Clean Drinking Water Storage
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Use closed, clean containers for municipal tap water storage. Add one cap of plain unscented bleach per 25L for informal settlement storage.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
