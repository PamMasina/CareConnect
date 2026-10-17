import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Service } from '../lib/types'
import { CLINICS, type Clinic } from '../lib/clinics'
import {
  CalendarPlus,
  CheckCircle2,
  Search,
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react'

const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export default function BookAppointment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clinicParam = searchParams.get('clinic')
  const preselectedClinic = clinicParam ? CLINICS.find(c => c.id === clinicParam) ?? null : null

  const [step, setStep] = useState(preselectedClinic ? 2 : 1)
  const [services, setServices] = useState<Service[]>([])
  const [clinic, setClinic] = useState<Clinic | null>(preselectedClinic ?? CLINICS[0] ?? null)
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [query, setQuery] = useState('')
  const [suburbFilter, setSuburbFilter] = useState('All')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .then(({ data }) => {
        const sList = (data as Service[]) ?? []
        setServices(sList)
        if (sList.length > 0 && !serviceId) {
          setServiceId(sList[0].id)
        }
      })
  }, [])

  const suburbs = useMemo(() => {
    const set = new Set(CLINICS.map(c => c.suburb))
    return ['All', ...Array.from(set).slice(0, 5)]
  }, [])

  const filteredClinics = CLINICS.filter(c => {
    const matchesQuery = (c.name + ' ' + c.suburb + ' ' + c.address)
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesSuburb = suburbFilter === 'All' || c.suburb === suburbFilter
    return matchesQuery && matchesSuburb
  })

  const submit = async () => {
    setError('')
    if (!user) {
      setError('Please sign in to book an appointment.')
      return
    }
    if (!clinic || !serviceId || !date || !time) {
      setError('Please complete all fields before confirming your appointment.')
      return
    }
    const scheduled = new Date(`${date}T${time}:00`).toISOString()
    setLoading(true)
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: user.id,
      doctor_id: null,
      service_id: serviceId,
      scheduled_at: scheduled,
      notes: clinic ? [notes, `Clinic: ${clinic.name}`].filter(Boolean).join(' · ') : notes || null,
      clinic: clinic?.name || null,
      status: 'booked',
    })
    setLoading(false)
    if (err) setError(err.message)
    else {
      setSuccess(true)
      setTimeout(() => navigate('/my-appointments'), 1500)
    }
  }

  const selectedService = services.find(s => s.id === serviceId)

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-emerald-200 shadow-lg text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your booking at <span className="font-semibold text-slate-900">{clinic?.name}</span> for{' '}
          <span className="font-semibold text-slate-900">{date} at {time}</span> has been logged.
        </p>
        <p className="text-xs text-slate-400">Redirecting to your appointments list…</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Book Clinic Appointment</h1>
              <p className="text-xs text-slate-500">CareConnect Health Platform</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            Step {step} of 4
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-xs font-medium">
          {[
            { n: 1, label: '1. Clinic' },
            { n: 2, label: '2. Service' },
            { n: 3, label: '3. Date & Time' },
            { n: 4, label: '4. Confirm' },
          ].map(s => (
            <div
              key={s.n}
              className={`pb-2 border-b-2 transition-colors ${
                step >= s.n ? 'border-teal-600 text-teal-800 font-bold' : 'border-slate-200 text-slate-400'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          STEP 1: SELECT CLINIC
         ========================================================================= */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Choose a Primary Healthcare Clinic</h2>
              <p className="text-xs text-slate-500">Select the facility closest to your home or work</p>
            </div>
            <div className="w-full sm:w-64 relative">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search clinic or suburb..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Suburb Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {suburbs.map(sub => (
              <button
                key={sub}
                type="button"
                onClick={() => setSuburbFilter(sub)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  suburbFilter === sub
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Clinic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredClinics.map(c => {
              const isSelected = clinic?.id === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setClinic(c)
                    setStep(2)
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{c.address}, {c.suburb}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                      {c.distance}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-teal-600" />
                      <span>{c.openTime} – {c.closeTime}</span>
                    </span>
                    <span className="text-teal-700 font-semibold">Select clinic ›</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 2: SELECT SERVICE
         ========================================================================= */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-teal-900">
              <Building2 size={16} className="text-teal-700 shrink-0" />
              <span>Selected Facility: <strong className="font-semibold">{clinic?.name}</strong></span>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Change
            </button>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">Select Clinical Service</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose the type of consultation required</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(s => {
              const isSelected = serviceId === s.id
              const isNurse = s.provider_role === 'nurse'
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setServiceId(s.id)
                    setStep(3)
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isNurse ? 'bg-cyan-100 text-cyan-700' : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {isNurse ? <HeartPulse size={16} /> : <Stethoscope size={16} />}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {s.duration_minutes} min
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-10.5 leading-relaxed">
                    {s.description || 'Routine public healthcare consultation.'}
                  </p>
                  <div className="mt-2.5 pl-10.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isNurse
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {isNurse ? <HeartPulse size={11} /> : <Stethoscope size={11} />}
                      {isNurse ? 'Nurse' : 'Doctor'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!serviceId}
              className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>Continue to Slot Picker</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: DATE & TIME
         ========================================================================= */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500">Clinic: </span>
              <strong className="text-slate-900">{clinic?.name}</strong>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-slate-500">Service: </span>
              <strong className="text-slate-900">{selectedService?.name}</strong>
            </div>
            <button onClick={() => setStep(2)} className="text-teal-700 font-semibold hover:underline">
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Select Consultation Date
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">Available Monday through Saturday.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Select Available Arrival Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIMES.map(t => {
                  const isSelected = time === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Clinical Symptoms or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Follow-up for blood pressure medication, renewal needed..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (!date || !time) {
                  setError('Please select both a date and an arrival time slot.')
                  return
                }
                setError('')
                setStep(4)
              }}
              className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <span>Review Booking Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: CONFIRMATION
         ========================================================================= */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review and Confirm Appointment</h2>
            <p className="text-xs text-slate-500 mt-0.5">Please check your consultation summary</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Clinic Location</span>
                <p className="font-bold text-slate-900 text-sm">{clinic?.name}</p>
                <p className="text-slate-500 mt-0.5">{clinic?.address}, {clinic?.suburb}</p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Healthcare Service</span>
                <p className="font-bold text-slate-900 text-sm">{selectedService?.name}</p>
                <p className="text-slate-500 mt-0.5">{selectedService?.duration_minutes} minutes duration</p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Scheduled Date & Time</span>
                <p className="font-bold text-teal-800 text-sm tabular-nums">
                  {date} at {time}
                </p>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Patient Details</span>
                <p className="font-bold text-slate-900 text-sm">{user?.user_metadata?.full_name || 'Registered Patient'}</p>
                <p className="text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            {notes && (
              <div className="pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-500 block mb-0.5">Patient Notes:</span>
                <p className="text-slate-800 italic">{notes}</p>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              Modify Details
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <CalendarPlus size={16} />
              <span>{loading ? 'Confirming booking...' : 'Confirm Appointment Booking'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}