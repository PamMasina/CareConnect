import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, AlertTriangle, Clock, Users, Stethoscope } from 'lucide-react'

export default function Home() {
  const { profile } = useAuth()
  const role = profile?.role

  if (role !== 'patient') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
        <p className="text-slate-500">Role: {role?.replace('_',' ')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/staff" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
            <Users className="text-teal-600 mb-2" />
            <h3 className="font-semibold">Staff Console</h3>
            <p className="text-xs text-slate-500">Appointments, queue & patients</p>
          </Link>
          <Link to="/sos-inbox" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
            <AlertTriangle className="text-red-600 mb-2" />
            <h3 className="font-semibold">SOS Inbox</h3>
            <p className="text-xs text-slate-500">Live emergency alerts</p>
          </Link>
          {role === 'admin' && (
            <Link to="/admin" className="block bg-white rounded-xl shadow p-4 hover:shadow-md">
              <Stethoscope className="text-slate-700 mb-2" />
              <h3 className="font-semibold">Admin</h3>
              <p className="text-xs text-slate-500">Manage clinic & users</p>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hi, {profile?.full_name}</h1>
      <p className="text-slate-500">Book an appointment or get help fast.</p>

      <Link to="/emergency" className="block bg-red-600 text-white rounded-2xl shadow p-5 hover:bg-red-700">
        <div className="flex items-center gap-3">
          <AlertTriangle />
          <div>
            <h3 className="font-bold text-lg">Emergency (SOS)</h3>
            <p className="text-sm opacity-90">Tap to alert first responders near you</p>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/clinics" className="bg-white rounded-xl shadow p-4">
          <Calendar className="text-teal-600 mb-2" />
          <h3 className="font-semibold text-sm">Book</h3>
          <p className="text-xs text-slate-500">New appointment</p>
        </Link>
        <Link to="/my-appointments" className="bg-white rounded-xl shadow p-4">
          <Clock className="text-teal-600 mb-2" />
          <h3 className="font-semibold text-sm">Mine</h3>
          <p className="text-xs text-slate-500">Upcoming visits</p>
        </Link>
      </div>
    </div>
  )
}
