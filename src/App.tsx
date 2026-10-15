import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Notifications from './pages/Notifications'
import BookAppointment from './pages/BookAppointment'
import Clinics from './pages/Clinics'
import HealthTips from './pages/HealthTips'
import Alerts from './pages/Alerts'
import MyAppointments from './pages/MyAppointments'
import QueueStatus from './pages/QueueStatus'
import Emergency from './pages/Emergency'
import StaffConsole from './pages/StaffConsole'
import FirstResponderInbox from './pages/FirstResponderInbox'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import MedicalRecord from './pages/MedicalRecord'
import EditProfile from './pages/EditProfile'
import NotFound from './pages/NotFound'

function FullPageLoader() {
  return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageLoader />
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-600 px-6 text-center">
      <p>We couldn’t load your profile.</p>
      <p className="text-sm text-slate-400">If you created this account before the database schema was set up, ask an admin to backfill your profile row.</p>
    </div>
  )
  if (roles && !roles.includes(profile.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/medical-record" element={<MedicalRecord />} />

        {/* Patient */}
        <Route path="/clinics" element={<ProtectedRoute><Clinics /></ProtectedRoute>} />
        <Route path="/health-tips" element={<ProtectedRoute><HealthTips /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
        <Route path="/my-appointments" element={<ProtectedRoute roles={['patient']}><MyAppointments /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute roles={['patient']}><QueueStatus /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute roles={['patient']}><Emergency /></ProtectedRoute>} />

        {/* Staff */}
        <Route path="/staff" element={<ProtectedRoute roles={['doctor','nurse','admin']}><StaffConsole /></ProtectedRoute>} />

        {/* First responders + staff view SOS */}
        <Route path="/sos-inbox" element={<ProtectedRoute roles={['first_responder','admin','nurse','doctor']}><FirstResponderInbox /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
