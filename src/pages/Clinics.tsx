import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Search, Filter, ArrowLeft, CalendarPlus } from 'lucide-react'

type Clinic = {
  id: string
  name: string
  address: string
  suburb: string
  phone: string
  openTime: string
  closeTime: string
  days: number[]
  distance: string
}

const CLINICS: Clinic[] = [
  { id: 'langa-chc', name: 'Langa CHC', address: 'Washington Rd', suburb: 'Langa', phone: '+27 21 694 3000', openTime: '07:30', closeTime: '19:00', days: [1,2,3,4,5,6], distance: '2.1 km' },
  { id: 'khayelitsha-clinic', name: 'Khayelitsha Clinic', address: 'Ntlazana Rd', suburb: 'Khayelitsha', phone: '+27 21 360 8400', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '4.8 km' },
  { id: 'mitchells-cdc', name: "Mitchells Plain CDC", address: 'AZ Berman Dr', suburb: "Mitchells Plain", phone: '+27 21 370 0730', openTime: '08:00', closeTime: '16:00', days: [1,2,3,4,5], distance: '9.2 km' },
  { id: 'gugulethu-chc', name: 'Gugulethu CHC', address: 'NY 108', suburb: 'Gugulethu', phone: '+27 21 638 6300', openTime: '07:00', closeTime: '20:00', days: [1,2,3,4,5], distance: '11.4 km' },
  { id: 'cape-town-community', name: 'Cape Town Community Clinic', address: '123 Long Street', suburb: 'Cape Town CBD', phone: '+27 21 000 0000', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5], distance: '3.0 km' },
]

function toMinutes(hhmm: string) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
function statusFor(c: Clinic, now = new Date()) {
  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (!c.days.includes(day)) return { open: false, label: `Closed · opens ${c.openTime}` }
  if (mins < toMinutes(c.openTime)) return { open: false, label: `Closed · opens ${c.openTime}` }
  if (mins >= toMinutes(c.closeTime)) return { open: false, label: `Closed · ${c.openTime}–${c.closeTime}` }
  return { open: true, label: `Open · closes ${c.closeTime}` }
}

const FILTERS = ['All', 'Open now', '< 5 km', 'antenatal']

export default function Clinics() {
  const navigate = useNavigate()
  const [now] = useState(() => new Date())
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = CLINICS.filter(c => {
    const s = statusFor(c, now)
    if (filter === 'Open now' && !s.open) return false
    if (filter === '< 5 km' && parseFloat(c.distance) >= 5) return false
    if (query && !`${c.name} ${c.suburb} ${c.address}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <div className="-mx-4 -mt-4">
      {/* Hero header */}
      <div className="bg-teal-600 text-white px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold flex-1">Nearby Clinics</h1>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">AS</div>
        </div>
        <p className="text-sm opacity-80">Cape Town, Western Cape</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow flex items-center gap-2 px-4 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clinics by name or area..." className="flex-1 outline-none text-sm" />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${filter === f ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 shadow'}`}>
              {filter !== 'All' && f === filter ? <Filter size={12} className="inline mr-1" /> : null}{f}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 self-center">CLINICS NEARBY YOU ({filtered.length})</span>
        </div>

        {/* Map placeholder */}
        <div className="bg-slate-200 rounded-2xl h-40 flex items-center justify-center text-slate-500 text-sm">Map view</div>

        {/* Clinic list */}
        <div className="bg-white rounded-2xl shadow divide-y divide-slate-100">
          {filtered.map(c => {
            const s = statusFor(c, now)
            return (
              <div key={c.id} className="p-4 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} /> {c.address} · {c.suburb}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {s.open ? 'Open' : 'Closed'}
                    </span>
                    <span className="text-xs text-slate-400">{c.distance}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> {c.openTime} – {c.closeTime} ({c.days.includes(6) ? 'Mon-Sat' : 'Mon-Fri'})
                </p>
                <p className="text-xs text-slate-400">{s.label}</p>
                <button
                  onClick={() => navigate('/appointments', { state: { clinic: { id: c.id, name: c.name, address: c.address, suburb: c.suburb } } })}
                  disabled={!s.open}
                  className="mt-2 w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CalendarPlus size={14} /> {s.open ? 'Book here' : 'Closed now'}
                </button>
              </div>
            )
          })}
          {filtered.length === 0 && <p className="p-4 text-sm text-slate-500 text-center">No clinics match.</p>}
        </div>
      </div>
    </div>
  )
}
