import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { createGoal, fetchGoals } from '../features/goals/goalsSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const goals = useSelector((s) => s.goals.items)
  const listStatus = useSelector((s) => s.goals.listStatus)
  const createStatus = useSelector((s) => s.goals.createStatus)
  const error = useSelector((s) => s.goals.error)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    dispatch(fetchGoals())
  }, [dispatch])

  const addGoal = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await dispatch(createGoal({ title, category, priority }))
    setTitle('')
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2>Dashboard</h2>
          <div>{user?.name ? `Hi, ${user.name}` : ''}</div>
        </div>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>

      <form onSubmit={addGoal} style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New goal title" />
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" style={{ flex: 1 }} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <button type="submit" disabled={createStatus === 'loading'}>
            {createStatus === 'loading' ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 18 }}>
        {listStatus === 'loading' ? <div>Loading goals...</div> : null}
        {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
        <ul style={{ paddingLeft: 16 }}>
          {goals.map((g) => (
            <li key={g._id}>
              {g.title} — {g.category} — {g.priority} — {g.status}
            </li>
          ))}
        </ul>
        {listStatus === 'succeeded' && goals.length === 0 ? <div>No goals yet.</div> : null}
      </div>
    </div>
  )
}
