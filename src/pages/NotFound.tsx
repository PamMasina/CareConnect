import { Link } from 'react-router-dom'
import { Home, AlertCircle, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <AlertCircle size={32} />
      </div>
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Page Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
          The requested page or health service route is unavailable or has moved. Return to your home portal.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors shadow-xs"
      >
        <Home size={15} />
        <span>Return to CareConnect Home</span>
      </Link>
    </div>
  )
}
