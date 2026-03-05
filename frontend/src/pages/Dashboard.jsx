import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { createGoal, deleteGoal, fetchGoals, setFilter, updateGoal } from '../features/goals/goalsSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items, listStatus, createStatus, error, filter } = useSelector((s) => s.goals)

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

  const visibleGoals = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((g) => g.status === filter)
  }, [items, filter])

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h2>Dashboard</h2>
          <div>{user?.name ? `Hi, ${user.name}` : ''}</div>
        </div>
        <button onClick={() => dispatch(logout())}>Logout</button>
      </div>

      <form onSubmit={addGoal} style={{ display: 'grid', gap: 10, marginTop: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New goal title" />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" style={{ flex: 1, minWidth: 180 }} />
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

      <div style={{ marginTop: 16 }}>
        <label>
          Filter:{' '}
          <select value={filter} onChange={(e) => dispatch(setFilter(e.target.value))}>
            <option value="all">all</option>
            <option value="active">active</option>
            <option value="completed">completed</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 18 }}>
        {listStatus === 'loading' ? <div>Loading goals...</div> : null}
        {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}

        <div style={{ display: 'grid', gap: 10 }}>
          {visibleGoals.map((g) => (
            <div
              key={g._id}
              style={{
                border: '1px solid #444',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{g.title}</div>
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                  {g.category} • {g.priority} • {g.status}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() =>
                    dispatch(
                      updateGoal({
                        id: g._id,
                        updates: { status: g.status === 'active' ? 'completed' : 'active' },
                      })
                    )
                  }
                >
                  {g.status === 'active' ? 'Complete' : 'Reopen'}
                </button>
                <button onClick={() => dispatch(deleteGoal(g._id))}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {listStatus === 'succeeded' && visibleGoals.length === 0 ? <div style={{ marginTop: 10 }}>No goals in this view.</div> : null}
      </div>
    </div>
  )
}
