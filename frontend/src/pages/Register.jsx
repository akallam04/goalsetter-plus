import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { token, status, error } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token) nav('/dashboard')
  }, [token, nav])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(register({ name, email, password }))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.6 }}>
            Goalsetter<span style={{ color: 'var(--accent-light)' }}>+</span>
          </div>
          <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>
            Plan it. Track it. Achieve it.
          </div>
        </div>

        <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 18 }}>Create account</div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label className="label">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </div>
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontWeight: 700, fontSize: 15, marginTop: 4 }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {error && (
          <p style={{ color: '#fca5a5', marginTop: 14, fontSize: 14, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: 22, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
