import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../lib/types'
import { MapPin, HeartPulse, Bell, AlertTriangle, BookOpen } from 'lucide-react'

export default function Home() {
  const { profile, user } = useAuth()
  const [upcoming, setUpcoming] = useState(0)
  const [nextAppt, setNextAppt] = useState<Appointment | null>(null)

  const initials = (profile?.full_name || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    if (!user) return
    supabase.from('appointments').select('*').eq('patient_id', user.id).in('status', ['booked', 'checked_in', 'in_progress'])
      .order('scheduled_at').limit(1).then(({ data }) => {
        const rows = (data as Appointment[]) ?? []
        setNextAppt(rows[0] ?? null)
        setUpcoming(rows.length)
      })
  }, [user])

  const role = profile?.role

  if (role !== 'patient') {
    return (
      <div className="space-y-4">
        <div className="bg-brand text-white rounded-2xl p-5">
          <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
          <p className="text-sm opacity-80">Role: {role?.replace('_',' ')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/staff" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
            <UsersCard title="Staff Console" desc="Appointments, queue & patients" />
          </Link>
          <Link to="/sos-inbox" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
            <UsersCard title="SOS Inbox" desc="Live emergency alerts" />
          </Link>
          {role === 'admin' && (
            <Link to="/admin" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
              <UsersCard title="Admin" desc="Manage clinic & users" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="-mx-4 -mt-4 space-y-4 pb-4">
      {/* Hero */}
      <div className="bg-teal-600 text-white px-4 pt-6 pb-16 rounded-b-3xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Hello, {profile?.full_name?.split(' ')[0] || 'there'}</p>
            <h1 className="text-2xl font-bold">ClinicConnect</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
            {initials}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 space-y-4">
        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard count={0} label="Unread messages" />
          <StatCard count={upcoming} label="Upcoming" />
        </div>

        {/* Next appointment */}
        {nextAppt && (
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{/* service name not loaded */ 'General Consultation'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(nextAppt.scheduled_at).toLocaleString(undefined, { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}  · Rm 4
                </p>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 rounded-full px-2 py-1">Booked</span>
            </div>
          </div>
        )}

        <p className="text-sm font-semibold text-slate-700">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/clinics" icon={<BookOpen size={22} />} label="Make a Booking" />
          <QuickAction to="/clinics" icon={<MapPin size={22} />} label="Nearby Clinics" />
          <QuickAction to="/health-tips" icon={<HeartPulse size={22} />} label="Health Tips" />
          <QuickAction to="/alerts" icon={<Bell size={22} />} label="Alerts" badge={5} />
        </div>

        <Link to="/emergency" className="block bg-red-600 text-white rounded-2xl p-4 text-center font-bold shadow-lg sos-pulse">
          <span className="flex items-center justify-center gap-2"><AlertTriangle /> Emergency SOS</span>
        </Link>
      </div>
    </div>
  )
}

function StatCard({ count, label }: { count: number; label: string }) {
  return (
    <div className="bg-teal-700 text-white rounded-2xl p-4">
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-xs mt-1 opacity-90">{label}</p>
    </div>
  )
}

function QuickAction({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link to={to} className="relative bg-teal-600 text-white rounded-2xl p-4 h-28 flex flex-col justify-between hover:opacity-90">
      {badge != null && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
      )}
      <div>{icon}</div>
      <p className="text-xs font-medium">{label}</p>
    </Link>
  )
}

function UsersCard({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </>
  )
}
