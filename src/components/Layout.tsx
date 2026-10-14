import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, AlertTriangle, Users, User, LogOut, ShieldCheck } from 'lucide-react'

interface NavItem { to: string; label: string; icon: any; roles?: string[] }

export function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role ?? 'patient'

  const items: NavItem[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/appointments', label: 'Book', icon: Calendar, roles: ['patient'] },
    { to: '/my-appointments', label: 'Mine', icon: Calendar, roles: ['patient'] },
    { to: '/queue', label: 'Queue', icon: Users, roles: ['patient'] },
    { to: '/emergency', label: 'SOS', icon: AlertTriangle, roles: ['patient'] },
    { to: '/staff', label: 'Staff', icon: Users, roles: ['doctor','nurse','admin'] },
    { to: '/sos-inbox', label: 'Inbox', icon: AlertTriangle, roles: ['first_responder','admin','nurse','doctor'] },
    { to: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['admin'] },
    { to: '/profile', label: 'Me', icon: User },
  ]

  const visible = items.filter(i => !i.roles || i.roles.includes(role))

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-teal-700">CareConnect</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{profile?.full_name} · {role.replace('_',' ')}</span>
            <button
              onClick={async () => { await signOut(); navigate('/login') }}
              className="text-slate-500 hover:text-red-600 p-1"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto flex justify-around">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to + label}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 text-xs gap-1 min-w-[64px] ${
                  isActive ? 'text-teal-700 font-semibold' : 'text-slate-500'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
