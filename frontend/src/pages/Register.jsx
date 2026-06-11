import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../features/auth/authSlice'
import AuthLayout, { AuthBrand } from '../components/AuthLayout'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { token, status, error } = useSelector((s) => s.auth)

  useEffect(() => {
    document.title = 'Goalsetter+ | Create account'
  }, [])

  useEffect(() => {
    if (token) nav('/dashboard')
  }, [token, nav])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(register({ name, email, password }))
  }

  return (
    <AuthLayout>
      <AuthBrand />

      <div style={{ marginBottom: 22 }}>
        <div className="mono-label" style={{ marginBottom: 5 }}>Initialize</div>
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em' }}>Create account</div>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 15 }}>
        <div>
          <label className="label">Name</label>
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
            minLength={6}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', padding: 13, fontSize: 15, marginTop: 4 }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Creating...' : 'Create account'}
        </button>
      </form>

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
        Already on board?{' '}
        <Link to="/login" style={{ color: 'var(--acc)' }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
