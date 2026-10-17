import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Search,
  Phone,
  Building2,
  CalendarPlus,
  Filter,
} from 'lucide-react'
import { CLINICS, type Clinic } from '../lib/clinics'

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function statusFor(c: Clinic, now = new Date()) {
  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (!c.days.includes(day)) return { open: false, label: `Closed · Opens ${c.openTime}` }
  if (mins < toMinutes(c.openTime)) return { open: false, label: `Closed · Opens ${c.openTime}` }
  if (mins >= toMinutes(c.closeTime)) return { open: false, label: `Closed · Closes ${c.closeTime}` }
  return { open: true, label: `Open · Closes ${c.closeTime}` }
}

const FILTERS = ['All', 'Open now', '< 5 km', 'Langa', 'Khayelitsha', 'Mitchells Plain', 'CBD']

export default function Clinics() {
  const [now] = useState(() => new Date())
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return CLINICS.filter(c => {
      const s = statusFor(c, now)
      if (filter === 'Open now' && !s.open) return false
      if (filter === '< 5 km' && parseFloat(c.distance) >= 5) return false
      if (filter === 'Langa' && c.suburb !== 'Langa') return false
      if (filter === 'Khayelitsha' && c.suburb !== 'Khayelitsha') return false
      if (filter === 'Mitchells Plain' && c.suburb !== 'Mitchells Plain') return false
      if (filter === 'CBD' && !c.suburb.includes('CBD')) return false

      if (query && !`${c.name} ${c.suburb} ${c.address}`.toLowerCase().includes(query.toLowerCase())) {
        return false
      }
      return true
    })
  }, [filter, query, now])

  return (
    <div className="space-y-6">
      {/* Directory Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
            <Building2 size={14} />
            <span>Western Cape Health Facilities</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cape Town Clinic Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover community day centres, operational hours, contact details, and book consultations
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium">
          Showing <span className="font-bold text-slate-900 tabular-nums">{filtered.length}</span> facilities
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clinics by name, suburb, or street address..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pb-1 text-xs">
          <Filter size={13} className="text-slate-400 shrink-0 ml-1" />
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(clinic => {
          const status = statusFor(clinic, now)
          return (
            <div
              key={clinic.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-bold text-base text-slate-900">{clinic.name}</h2>
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                    {clinic.distance}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span>{clinic.address}, {clinic.suburb}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400 shrink-0" />
                    <span className="tabular-nums">
                      {clinic.openTime} – {clinic.closeTime}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      status.open
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${clinic.phone.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone size={13} className="text-teal-700" />
                  <span>Call Clinic</span>
                </a>

                <Link
                  to={`/appointments?clinic=${clinic.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <CalendarPlus size={13} />
                  <span>Book Visit</span>
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
