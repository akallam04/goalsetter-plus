import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('arun@test.com')
  const [password, setPassword] = useState('password123')
  const dispatch = useDispatch()
  const nav = useNavigate()
  const { token, status, error } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token) nav('/dashboard')
  }, [token, nav])

  const onSubmit = (e) => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button disabled={status === 'loading'}>{status === 'loading' ? 'Signing in...' : 'Sign in'}</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
