import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SharedView = lazy(() => import('./pages/SharedView'))

function Loader() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <svg width="34" height="34" viewBox="0 0 32 32" className="cursor-blink" aria-hidden="true">
          <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
          <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
          <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className="mono-label">LOADING</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:token" element={<SharedView />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
