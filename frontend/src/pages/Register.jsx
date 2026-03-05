import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { register } from '../features/auth/authSlice'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('Arun')
  const [email, setEmail] = useState('')
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
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button disabled={status === 'loading'}>{status === 'loading' ? 'Creating...' : 'Create account'}</button>
      </form>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
