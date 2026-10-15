import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { User, FileText } from 'lucide-react'

export default function Profile() {
  const { profile, user, role } = useAuth()
  const clinic = (user as any)?.user_metadata?.clinic
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <User className="text-teal-700" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{profile?.full_name}</h2>
          <p className="text-sm text-slate-500">{role?.replace('_',' ')}{clinic ? ` · ${clinic}` : ''}</p>
        </div>
      </div>
      <div className="text-sm text-slate-600 space-y-1">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        {profile?.phone && <p><span className="font-medium">Phone:</span> {profile.phone}</p>}
        <p><span className="font-medium">User ID:</span> <span className="font-mono text-xs">{profile?.id}</span></p>
        <Link to="/medical-record" className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100">
          <span className="font-medium text-sm flex items-center gap-2"><FileText size={16} /> Medical record</span>
          <span className="text-slate-400">›</span>
        </Link>
        <Link to="/edit-profile" className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100">
          <span className="font-medium text-sm flex items-center gap-2"><User size={16} /> Edit profile</span>
          <span className="text-slate-400">›</span>
        </Link>
      </div>
    </div>
  )
}
