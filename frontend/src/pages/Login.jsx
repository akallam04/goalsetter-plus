import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../features/auth/authSlice'
import AuthLayout, { AuthBrand } from '../components/AuthLayout'
import { IconSpark } from '../components/icons'

// Public by design: the demo account is seeded via backend/scripts/seed-demo.mjs
const DEMO_CREDENTIALS = { email: 'demo@goalsetter.app', password: 'demo-goals-2026' }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [demoClicked, setDemoClicked] = useState(false)
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { token, status, error } = useSelector((s) => s.auth)

  useEffect(() => {
    document.title = 'Goalsetter+ | Sign in'
  }, [])

  useEffect(() => {
    if (token) nav('/dashboard')
  }, [token, nav])

  const onSubmit = (e) => {
    e.preventDefault()
    setDemoClicked(false)
    dispatch(login({ email, password }))
  }

  const tryDemo = () => {
    setDemoClicked(true)
    dispatch(login(DEMO_CREDENTIALS))
  }

  return (
    <AuthLayout>
      <AuthBrand />

      <div style={{ marginBottom: 22 }}>
        <div className="mono-label" style={{ marginBottom: 5 }}>Welcome back</div>
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em' }}>Sign in</div>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 15 }}>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', padding: 13, fontSize: 15, marginTop: 4 }}
          disabled={status === 'loading'}
        >
          {status === 'loading' && !demoClicked ? 'Authenticating...' : 'Sign in'}
        </button>
      </form>

      {/* Instant access for visitors: no signup required */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 14px' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span className="mono-label">OR</span>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <button
        type="button"
        className="btn-ghost-acc"
        style={{
          width: '100%', padding: 13, fontSize: 14.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        }}
        onClick={tryDemo}
        disabled={status === 'loading'}
      >
        <IconSpark size={15} />
        {status === 'loading' && demoClicked ? 'Loading demo board...' : 'Try the live demo'}
      </button>
      <div
        className="mono"
        style={{
          marginTop: 9, textAlign: 'center', fontSize: 9.5,
          letterSpacing: '0.12em', color: 'var(--dim)',
        }}
      >
        ONE CLICK · PRELOADED BOARD · NO SIGNUP
      </div>

      {error && (
        <div
          className="mono"
          style={{
            marginTop: 14, padding: '10px 13px', fontSize: 12,
            color: 'var(--red)', background: 'var(--red-bg)',
            border: '1px solid var(--red-bd)', borderRadius: 'var(--r-s)',
          }}
        >
          {error}
        </div>
      )}

      <p style={{ marginTop: 22, color: 'var(--mut)', fontSize: 13.5 }}>
        New here?{' '}
        <Link to="/register" style={{ color: 'var(--acc)' }}>Create an account</Link>
      </p>
    </AuthLayout>
  )
}
