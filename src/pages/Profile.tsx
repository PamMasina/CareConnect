import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  FileText,
  Building2,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  LogOut,
  CalendarCheck,
  Edit3,
  MapPin,
  HeartHandshake,
} from 'lucide-react'

export default function Profile() {
  const { profile, user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const clinic = (user as any)?.user_metadata?.clinic || profile?.clinic || null
  const staffNumber = (user as any)?.user_metadata?.staff_number || null
  const meta = (user as any)?.user_metadata || {}
  const address = meta.address || {}
  const nok = meta.next_of_kin || {}

  const initials = (profile?.full_name || 'Care Member')
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {profile?.full_name || 'Care Member'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Registered Role: <span className="capitalize font-semibold text-slate-800">{role?.replace('_', ' ')}</span>
            </p>
            {role !== 'patient' && (
              <p className="text-xs text-slate-500 font-medium">
                Staff Number: <span className="font-semibold text-slate-800">{staffNumber}</span>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-600">
              {clinic && (
                <span className="flex items-center gap-1">
                  <Building2 size={13} className="text-teal-600" />
                  <span>{clinic}</span>
                </span>
              )}
              <span>·</span>
              <span className="font-mono text-slate-400 text-[11px]">ID: {profile?.id?.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Mail size={16} className="text-slate-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Email Address</span>
              <span className="font-medium text-slate-800 truncate">{user?.email}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Phone size={16} className="text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Contact Phone</span>
              <span className="font-medium text-slate-800">{profile?.phone || '+27 71 234 5678'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900">Saved Profile Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Full Name</span>
            <span className="font-medium text-slate-800">{profile?.full_name || 'Not provided'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Phone Number</span>
            <span className="font-medium text-slate-800">{profile?.phone || 'Not provided'}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Residential Address</span>
            <span className="font-medium text-slate-800">
              {[address.streetNo, address.streetName].filter(Boolean).join(' ') || 'Not provided'}
            </span>
            {(address.suburb || address.city) && (
              <p className="text-xs text-slate-600 mt-0.5">
                {[address.suburb, address.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
          <HeartHandshake size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Next of Kin</span>
            <span className="font-medium text-slate-800">{nok.name || 'Not provided'}</span>
            {(nok.relationship || nok.phone) && (
              <p className="text-xs text-slate-600 mt-0.5">
                {[nok.relationship, nok.phone].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-xs divide-y divide-slate-100">
        {role === 'patient' && (
          <>
            <Link
              to="/medical-record"
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Clinical Medical Record</p>
                  <p className="text-xs text-slate-500">View allergies, chronic prescriptions, and visit histories</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/my-appointments"
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">Appointment History</p>
                  <p className="text-xs text-slate-500">Upcoming, in-progress, and past clinic consultations</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </>
        )}

        <Link
          to="/edit-profile"
          className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Edit3 size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">Edit Personal Profile</p>
              <p className="text-xs text-slate-500">Update phone number, clinic assignment, and address</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Sign Out Card */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-between">
        <span className="text-xs text-slate-500">Signed in as {user?.email}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
