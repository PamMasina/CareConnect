import { useAuth } from '../context/AuthContext'
import { User } from 'lucide-react'

export default function Profile() {
  const { profile, user, role } = useAuth()
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
          <User className="text-teal-700" />
        </div>
        <div>
          <h2 className="font-bold text-lg">{profile?.full_name}</h2>
          <p className="text-sm text-slate-500">{role?.replace('_',' ')}</p>
        </div>
      </div>
      <div className="text-sm text-slate-600 space-y-1">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        {profile?.phone && <p><span className="font-medium">Phone:</span> {profile.phone}</p>}
        <p><span className="font-medium">User ID:</span> <span className="font-mono text-xs">{profile?.id}</span></p>
      </div>
    </div>
  )
}
