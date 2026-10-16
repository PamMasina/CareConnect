import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Activity,
  Calendar,
  CalendarCheck,
  Users,
  AlertTriangle,
  User,
  LogOut,
  ShieldCheck,
  PhoneCall,
  MapPin,
  Building2,
  BookOpen,
  Bell,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  HeartHandshake,
} from 'lucide-react'

interface NavLinkItem {
  to: string
  label: string
  icon: any
  badge?: string
  emergency?: boolean
  roles?: string[]
}

export function Layout() {
  const { session, profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)

  const role = profile?.role || 'patient'
  const clinic = profile?.clinic ?? null

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
    navigate('/')
  }

  // Primary desktop top-bar nav links
  const mainNavLinks: NavLinkItem[] = [
    { to: '/', label: 'Home', icon: Activity },
    { to: '/clinics', label: 'Clinics', icon: Building2 },
    { to: session ? '/appointments' : '/login', label: 'Book Visit', icon: Calendar },
    { to: '/queue', label: 'Live Queue', icon: Users },
    { to: '/health-tips', label: 'Health Advisory', icon: BookOpen },
    { to: '/alerts', label: 'Alerts', icon: Bell },
    { to: '/emergency', label: 'Emergency SOS', icon: AlertTriangle, emergency: true },
  ]

  // Role-specific workspace links
  const roleWorkspaces: { [key: string]: { to: string; label: string; icon: any } } = {
    patient: { to: '/my-appointments', label: 'My Consultations', icon: CalendarCheck },
    doctor: { to: '/staff', label: 'Doctor Console', icon: Stethoscope },
    nurse: { to: '/staff', label: 'Nurse Triage', icon: Activity },
    first_responder: { to: '/sos-inbox', label: 'EMS Dispatch Inbox', icon: AlertTriangle },
    admin: { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
  }

  // Mobile bottom bar items (curated 5 primary targets)
  const mobileBottomItems: NavLinkItem[] = session
    ? role === 'patient'
      ? [
          { to: '/', label: 'Home', icon: Activity },
          { to: '/appointments', label: 'Book', icon: Calendar },
          { to: '/my-appointments', label: 'My Visits', icon: CalendarCheck },
          { to: '/queue', label: 'Queue', icon: Users },
          { to: '/emergency', label: 'SOS', icon: AlertTriangle, emergency: true },
        ]
      : role === 'first_responder'
      ? [
          { to: '/', label: 'Home', icon: Activity },
          { to: '/sos-inbox', label: 'EMS SOS', icon: AlertTriangle, emergency: true },
          { to: '/clinics', label: 'Clinics', icon: Building2 },
          { to: '/profile', label: 'Profile', icon: User },
        ]
      : [
          { to: '/', label: 'Home', icon: Activity },
          { to: '/staff', label: 'Staff Console', icon: Activity },
          { to: '/sos-inbox', label: 'SOS Inbox', icon: AlertTriangle },
          { to: '/clinics', label: 'Clinics', icon: Building2 },
          { to: '/profile', label: 'Profile', icon: User },
        ]
    : [
        { to: '/', label: 'Home', icon: Activity },
        { to: '/clinics', label: 'Clinics', icon: Building2 },
        { to: '/queue', label: 'Queue', icon: Users },
        { to: '/health-tips', label: 'Advice', icon: BookOpen },
        { to: '/emergency', label: 'SOS', icon: AlertTriangle, emergency: true },
      ]

  const roleLabels: Record<string, string> = {
    patient: 'Patient Member',
    doctor: 'Medical Doctor',
    nurse: 'Senior Healthcare Nurse',
    first_responder: 'EMS Paramedic',
    admin: 'System Administrator',
  }

  const roleBadgeColors: Record<string, string> = {
    patient: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    doctor: 'bg-teal-50 text-teal-800 border-teal-200',
    nurse: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    first_responder: 'bg-amber-50 text-amber-900 border-amber-200',
    admin: 'bg-slate-100 text-slate-800 border-slate-300',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* =========================================================================
          1. TOP UTILITY / INSTITUTIONAL TRUST BANNER
         ========================================================================= */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-white tracking-wide">Western Cape Public Health Network</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden sm:inline text-slate-400">City of Cape Town Clinics & Community Health Centres</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
            <div className="hidden md:flex items-center gap-2 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>22 Facilities Active</span>
            </div>
            <a
              href="tel:10177"
              className="text-red-300 hover:text-white font-semibold transition-colors flex items-center gap-1"
            >
              <PhoneCall size={12} className="text-red-400" />
              <span>Ambulance: 10177</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="tel:112"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Cell: 112
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. STRICT 3-ZONE TOP BAR CONTRACT
          [Zone 1: Brand Wordmark] — [Zone 2: 4-5 Nav Links] — [Zone 3: 1 Primary Action]
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4.5rem] py-3 flex flex-wrap items-center justify-between gap-4 sm:gap-8">
          {/* ZONE 1: BRAND WORDMARK (Single text element with distinctive medical emblem) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Activity size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                CareConnect
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-normal -mt-0.5">
                Cape Town Health Portal
              </span>
            </div>
          </Link>

          {/* ZONE 2: NAVIGATION LINKS (Single-line, 1-2 word labels, clean hover underlines) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-sm font-medium text-slate-600 flex-wrap">
            {mainNavLinks.map(link => {
              const Icon = link.icon
              const isEmergency = link.emergency
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `whitespace-nowrap transition-colors py-1 relative flex items-center gap-1.5 ${
                      isActive
                        ? isEmergency
                          ? 'text-red-700 font-bold'
                          : 'text-teal-700 font-bold'
                        : isEmergency
                        ? 'text-red-600 hover:text-red-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={15} className={isEmergency ? 'text-red-600' : 'text-slate-400'} />
                  {isEmergency && <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block animate-pulse"></span>}
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* ZONE 3: PRIMARY ACTION / USER PROFILE & DEMO SWITCHER */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Authenticated User Menu OR Sign In Button */}
            {session && profile ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {profile.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {profile.full_name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium capitalize">
                      {role.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{profile.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600">
                        {clinic && (
                          <>
                            <MapPin size={12} className="text-slate-400" />
                            <span>{clinic}</span>
                          </>
                        )}
                      </div>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${roleBadgeColors[role] || 'bg-slate-100'}`}>
                        {roleLabels[role] || role}
                      </span>
                    </div>

                    <div className="py-1">
                      {roleWorkspaces[role] && (
                        <Link
                          to={roleWorkspaces[role].to}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Activity size={15} />
                          <span>{roleWorkspaces[role].label}</span>
                        </Link>
                      )}

                      {role === 'patient' && (
                        <>
                          <Link
                            to="/my-appointments"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <CalendarCheck size={15} className="text-slate-400" />
                            <span>My Consultations</span>
                          </Link>
                          <Link
                            to="/medical-record"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Activity size={15} className="text-slate-400" />
                            <span>Medical Records</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <User size={15} className="text-slate-400" />
                        <span>Profile & Contact Details</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        <LogOut size={15} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs whitespace-nowrap"
                >
                  Register Profile
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-150">
            <nav className="space-y-1">
              {mainNavLinks.map(link => {
                const Icon = link.icon
                const isEmergency = link.emergency
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? isEmergency
                            ? 'bg-red-600 text-white'
                            : 'bg-teal-600 text-white'
                          : isEmergency
                          ? 'text-red-700 hover:bg-red-50 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{link.label}</span>
                    </div>
                    {isEmergency && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">24/7 SOS</span>}
                  </NavLink>
                )
              })}
            </nav>

          </div>
        )}
      </header>

      {/* =========================================================================
          3. MAIN CONTENT VIEWPORT
         ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-24 lg:pb-16">
        <Outlet />
      </main>

      {/* =========================================================================
          4. PROPER COMPREHENSIVE INSTITUTIONAL FOOTER
         ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Column 1: Brand & Mandate */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Activity size={20} className="stroke-[2.5]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">CareConnect</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Empowering Cape Town residents with transparent clinic waiting times, seamless appointment scheduling, and rapid GPS-linked emergency medical dispatch across public health facilities.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <HeartHandshake size={16} />
                <span>Western Cape Department of Health Partner Facility Network</span>
              </div>
            </div>

            {/* Column 2: Emergency Hotlines */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Emergency Hotlines
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="tel:10177" className="text-red-400 hover:text-red-300 font-bold block">
                    Ambulance Dispatch: 10177
                  </a>
                  <span className="text-[11px] text-slate-500">Toll-free landline & cell</span>
                </li>
                <li>
                  <a href="tel:112" className="text-slate-200 hover:text-white font-semibold block">
                    National Emergency: 112
                  </a>
                  <span className="text-[11px] text-slate-500">Free from any mobile phone</span>
                </li>
                <li>
                  <a href="tel:0861555777" className="text-slate-300 hover:text-white block">
                    Poison Helpline: 0861 555 777
                  </a>
                </li>
                <li>
                  <a href="tel:0800150150" className="text-slate-300 hover:text-white block">
                    GBV Command Centre: 0800 150 150
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Patient Services */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Services & Care
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/clinics" className="hover:text-white transition-colors">
                    Clinic Directory (20+ Facilities)
                  </Link>
                </li>
                <li>
                  <Link to="/appointments" className="hover:text-white transition-colors">
                    Book Consultation Online
                  </Link>
                </li>
                <li>
                  <Link to="/queue" className="hover:text-white transition-colors">
                    Live Queue Status
                  </Link>
                </li>
                <li>
                  <Link to="/health-tips" className="hover:text-white transition-colors">
                    Health Tips & Wellness Guides
                  </Link>
                </li>
                <li>
                  <Link to="/alerts" className="hover:text-white transition-colors">
                    Public Disease & Weather Alerts
                  </Link>
                </li>
                <li>
                  <Link to="/emergency" className="hover:text-white transition-colors text-red-400">
                    One-Tap Emergency SOS
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Facility Hubs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Key Community Centres
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <span className="text-slate-200 font-medium">Langa Community Health Centre</span>
                  <p className="text-slate-500">Mon–Fri: 07:30 – 16:30 · 24/7 Maternity</p>
                </li>
                <li>
                  <span className="text-slate-200 font-medium">Khayelitsha Shared Services</span>
                  <p className="text-slate-500">Mon–Fri: 07:00 – 17:00 · Triage active</p>
                </li>
                <li>
                  <span className="text-slate-200 font-medium">Gugulethu Clinic</span>
                  <p className="text-slate-500">Mon–Fri: 07:30 – 16:30 · Pharmacy on-site</p>
                </li>
                <li>
                  <span className="text-slate-200 font-medium">Mitchells Plain CDC</span>
                  <p className="text-slate-500">24/7 Emergency Casualty Unit</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>
              © {new Date().getFullYear()} CareConnect Health Platform.
            </p>
            <div className="flex items-center gap-4">
              <span>POPIA Act Compliant</span>
              <span>·</span>
              <span>Electronic Medical Record Security</span>
              <span>·</span>
              <span>Free Primary Healthcare</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          5. MOBILE BOTTOM NAVIGATION (Fixed bottom on touch screens, max 5 items)
         ========================================================================= */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          {mobileBottomItems.map(item => {
            const Icon = item.icon
            const isSos = item.emergency
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                    isActive
                      ? isSos
                        ? 'text-red-600 font-semibold'
                        : 'text-teal-700 font-semibold'
                      : isSos
                      ? 'text-red-500'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <div className={`p-1 rounded-lg ${isSos ? 'bg-red-50 text-red-600' : ''}`}>
                  <Icon size={19} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
