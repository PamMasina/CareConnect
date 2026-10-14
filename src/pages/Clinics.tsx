import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, Phone, CalendarPlus } from 'lucide-react'

type Clinic = {
  id: string
  name: string
  address: string
  suburb: string
  phone: string
  openTime: string // HH:MM
  closeTime: string // HH:MM
  days: number[] // 0 Sun .. 6 Sat
}

const CLINICS: Clinic[] = [
  { id: 'ctcc-longstreet', name: 'Cape Town Community Clinic', address: '123 Long Street', suburb: 'Cape Town CBD', phone: '+27 21 000 0000', openTime: '08:00', closeTime: '17:00', days: [1,2,3,4,5] },
  { id: 'khayelitsha-chc', name: 'Khayelitsha District (CHC Site)', address: 'Cnr Spine Rd & Walter Sisulu Rd', suburb: 'Khayelitsha', phone: '+27 21 360 8400', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5] },
  { id: 'mitchells-plain-chc', name: 'Mitchells Plain CHC', address: 'Cnr AZ Berman Dr & Wespoort Dr', suburb: 'Mitchells Plain', phone: '+27 21 370 0730', openTime: '07:30', closeTime: '16:30', days: [1,2,3,4,5] },
  { id: 'gugulethu-chc', name: 'Gugulethu CHC', address: 'NY 3A & NY 4', suburb: 'Gugulethu', phone: '+27 21 638 6300', openTime: '07:30', closeTime: '16:00', days: [1,2,3,4,5] },
  { id: 'heideveld-chc', name: 'Heideveld CHC', address: '736 Vanguard Dr', suburb: 'Heideveld', phone: '+27 21 690 3800', openTime: '08:00', closeTime: '16:00', days: [1,2,3,4,5] },
  { id: 'bonteheuwel-chc', name: 'Bonteheuwel CHC', address: 'Bonteheuwel Ave', suburb: 'Bonteheuwel', phone: '+27 21 590 8600', openTime: '07:30', closeTime: '16:00', days: [1,2,3,4,5] },
  { id: 'kraaifontein-chc', name: 'Kraaifontein CHC', address: 'Botfontein Rd', suburb: 'Kraaifontein', phone: '+27 21 987 5600', openTime: '08:00', closeTime: '16:30', days: [1,2,3,4,5] },
]

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function statusFor(c: Clinic, now = new Date()) {
  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  const open = toMinutes(c.openTime)
  const close = toMinutes(c.closeTime)
  if (!c.days.includes(day)) {
    // next open day
    return { open: false, label: `Closed · opens ${c.openTime} next working day` }
  }
  if (mins < open) return { open: false, label: `Closed · opens ${c.openTime}` }
  if (mins >= close) return { open: false, label: `Closed · opened ${c.openTime}–${c.closeTime}` }
  return { open: true, label: `Open now · closes ${c.closeTime}` }
}

export default function Clinics() {
  const navigate = useNavigate()
  const [now] = useState(() => new Date())

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Choose a clinic</h1>
        <p className="text-sm text-slate-500">Cape Town clinics and their opening hours. Select one to book an appointment.</p>
      </div>

      <div className="space-y-3">
        {CLINICS.map((c) => {
          const s = statusFor(c, now)
          return (
            <div key={c.id} className="bg-white rounded-2xl shadow p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={14} /> {c.address}, {c.suburb}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.open ? 'Open' : 'Closed'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Clock size={14} /> {c.openTime} – {c.closeTime}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {c.phone}</span>
              </div>
              <p className={`text-xs ${s.open ? 'text-emerald-700' : 'text-slate-500'}`}>{s.label}</p>

              <button
                onClick={() => navigate('/appointments', { state: { clinic: c } })}
                disabled={!s.open}
                className="w-full bg-teal-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CalendarPlus size={16} /> {s.open ? 'Book here' : 'Closed now'}
              </button>
            </div>
          )
        })}
      </div>

      <Link to="/" className="block text-center text-sm text-teal-600 underline">Back to home</Link>
    </div>
  )
}
