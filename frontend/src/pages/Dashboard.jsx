import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import {
  createGoal, deleteGoal, fetchGoals, fetchStats,
  setFilter, updateGoal,
} from '../features/goals/goalsSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items, listStatus, createStatus, error, filter, stats } = useSelector((s) => s.goals)

  // Create form
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate]   = useState('')

  // List controls
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('newest')

  // Edit modal
  const [editing, setEditing]               = useState(null)
  const [editTitle, setEditTitle]           = useState('')
  const [editCategory, setEditCategory]     = useState('')
  const [editPriority, setEditPriority]     = useState('medium')
  const [editDueDate, setEditDueDate]       = useState('')
  const [editStatus, setEditStatus]         = useState('active')
  const [editDescription, setEditDescription] = useState('')

  // UX state
  const [toast, setToast]                 = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Ref for keyboard shortcut N → focus title input
  const titleInputRef = useRef(null)

  useEffect(() => {
    dispatch(fetchGoals())
    dispatch(fetchStats())
  }, [dispatch])

  // Press N to focus the title input (skip if typing in a field or modal is open)
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (editing) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        titleInputRef.current?.focus()
        titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editing])

  const refreshStats = () => dispatch(fetchStats())

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  /* ── Create ── */
  const addGoal = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = { title, category, priority }
    if (dueDate) payload.dueDate = `${dueDate}T12:00:00`
    await dispatch(createGoal(payload))
    setTitle('')
    setDueDate('')
    refreshStats()
    showToast('Goal added!')
  }

  /* ── Edit ── */
  const openEdit = (g) => {
    setEditing(g)
    setEditTitle(g.title || '')
    setEditCategory(g.category || 'General')
    setEditPriority(g.priority || 'medium')
    setEditStatus(g.status || 'active')
    setEditDueDate(g.dueDate ? String(g.dueDate).slice(0, 10) : '')
    setEditDescription(g.description || '')
  }

  const closeEdit = () => {
    setEditing(null)
    setEditTitle('')
    setEditCategory('')
    setEditPriority('medium')
    setEditDueDate('')
    setEditStatus('active')
    setEditDescription('')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editing || !editTitle.trim()) return
    await dispatch(updateGoal({
      id: editing._id,
      updates: {
        title: editTitle,
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        description: editDescription,
        dueDate: editDueDate ? `${editDueDate}T12:00:00` : null,
      },
    }))
    closeEdit()
    refreshStats()
    showToast('Goal updated!')
  }

  /* ── Toggle complete ── */
  const handleToggle = async (g) => {
    const next = g.status === 'active' ? 'completed' : 'active'
    await dispatch(updateGoal({ id: g._id, updates: { status: next } }))
    refreshStats()
    showToast(next === 'completed' ? 'Marked as complete!' : 'Goal reopened')
  }

  /* ── Delete ── */
  const handleDelete = async (id) => {
    await dispatch(deleteGoal(id))
    setConfirmDelete(null)
    refreshStats()
    showToast('Goal deleted', 'error')
  }

  /* ── Filtering & sorting ── */
  const priorityRank = { high: 3, medium: 2, low: 1 }

  const visibleGoals = useMemo(() => {
    let result = [...items]
    if (filter !== 'all') result = result.filter((g) => g.status === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((g) => g.title.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'dueSoon') {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER
        return aDue - bDue
      }
      if (sortBy === 'priorityHigh')
        return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return result
  }, [items, filter, search, sortBy])

  /* ── Helpers ── */
  const formatDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Denver',
    })
  }

  const isOverdue = (g) => {
    if (!g?.dueDate || g.status !== 'active') return false
    const due = new Date(g.dueDate)
    if (Number.isNaN(due.getTime())) return false
    // Compare calendar dates in Mountain Time
    const mst = { timeZone: 'America/Denver' }
    const dueStr   = due.toLocaleDateString('en-CA', mst)      // YYYY-MM-DD
    const todayStr = new Date().toLocaleDateString('en-CA', mst)
    return dueStr < todayStr
  }

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const statCards = [
    { label: 'Total',     value: stats.total,     color: 'var(--accent-light)', icon: '◎' },
    { label: 'Active',    value: stats.active,    color: 'var(--cyan-light)',   icon: '◉' },
    { label: 'Done',      value: stats.completed, color: '#6ee7b7',             icon: '✓' },
    { label: 'Overdue',   value: stats.overdue,   color: '#fca5a5',             icon: '!' },
  ]

  /* ─────────────────────────── Render ─────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ width: '100%', maxWidth: 1020, margin: '0 auto', display: 'grid', gap: 16 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.6 }}>
              Goalsetter<span style={{ color: 'var(--accent-light)' }}>+</span>
            </div>
            <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 14 }}>
              {user?.name
                ? `Hey ${user.name} — let's make progress today.`
                : 'Set a goal. Make it real.'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar">{initials}</div>
            <button
              onClick={() => dispatch(logout())}
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="stats-row">
          {statCards.map(({ label, value, color, icon }) => (
            <div key={label} className="stat-card">
              <div className="stat-number" style={{ color }}>{value ?? '—'}</div>
              <div className="stat-label">{icon} {label}</div>
            </div>
          ))}
        </div>

        {/* ── Completion rate bar ── */}
        {stats.total > 0 && (
          <div className="card" style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                COMPLETION RATE
              </span>
              <span style={{ fontSize: 14, color: 'var(--accent-light)', fontWeight: 800 }}>
                {completionRate}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${completionRate}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}

        {/* ── Create form + Controls ── */}
        <div className="main-grid">

          {/* Create form */}
          <div className="card">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', gap: 12, marginBottom: 14,
            }}>
              <div className="section-title">Add a Goal</div>
              <div style={{ color: 'var(--muted2)', fontSize: 12 }}>Clear, specific, achievable</div>
            </div>
            <form onSubmit={addGoal} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="label">What do you want to achieve?</label>
                <input
                  ref={titleInputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Ship my portfolio project by end of month"
                />
              </div>
              <div className="form-grid-3">
                <div>
                  <label className="label">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Career"
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                {error
                  ? <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div>
                  : <div />}
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '11px 28px', fontWeight: 700, fontSize: 15 }}
                  disabled={createStatus === 'loading'}
                >
                  {createStatus === 'loading' ? 'Adding…' : '+ Add Goal'}
                </button>
              </div>
            </form>
          </div>

          {/* Filter + sort controls */}
          <div className="card" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <div className="section-title">Filter &amp; Sort</div>

            <div>
              <label className="label">Status</label>
              <div className="filter-group">
                {['all', 'active', 'completed'].map((f) => (
                  <button
                    key={f}
                    className={`filter-btn${filter === f ? ' active' : ''}`}
                    onClick={() => dispatch(setFilter(f))}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Search</label>
              <div className="search-wrap">
                <span className="search-icon">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title…"
                />
              </div>
            </div>

            <div>
              <label className="label">Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="dueSoon">Due date (soonest)</option>
                <option value="priorityHigh">Priority (high → low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Goals list ── */}
        <div className="card">
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 12, marginBottom: 14,
          }}>
            <div className="section-title">
              Your Goals
              {visibleGoals.length > 0 && (
                <span style={{
                  color: 'var(--muted2)', fontWeight: 400,
                  fontSize: 14, marginLeft: 8,
                }}>
                  ({visibleGoals.length})
                </span>
              )}
            </div>
            {listStatus === 'loading' && (
              <div style={{ color: 'var(--muted2)', fontSize: 13 }}>Loading…</div>
            )}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {visibleGoals.map((g) => (
              <div
                key={g._id}
                className={[
                  'goal-card',
                  `priority-${g.priority}`,
                  g.status === 'completed' ? 'completed' : '',
                  'fade-in',
                ].filter(Boolean).join(' ')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="goal-title">{g.title}</div>
                  {g.description && (
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                      {g.description}
                    </div>
                  )}
                  <div className="goal-meta">
                    <span className={`badge badge-${g.priority}`}>{g.priority}</span>
                    <span className="badge badge-default">{g.category}</span>
                    {g.dueDate && (
                      <span className={`badge ${isOverdue(g) ? 'badge-overdue' : 'badge-default'}`}>
                        {isOverdue(g) ? '⚠ ' : ''}
                        {formatDate(g.dueDate)}
                      </span>
                    )}
                    <span className={`badge badge-${g.status}`}>
                      {g.status === 'completed' ? '✓ done' : 'active'}
                    </span>
                  </div>
                </div>

                <div className="goal-actions">
                  {confirmDelete === g._id ? (
                    <>
                      <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>
                        Delete?
                      </span>
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => handleDelete(g._id)}
                      >
                        Yes
                      </button>
                      <button
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setConfirmDelete(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={{ padding: '7px 12px', fontSize: 12 }}
                        onClick={() => openEdit(g)}
                      >
                        Edit
                      </button>
                      <button
                        className={g.status === 'active' ? 'btn-success' : ''}
                        style={{ padding: '7px 12px', fontSize: 12 }}
                        onClick={() => handleToggle(g)}
                      >
                        {g.status === 'active' ? '✓ Done' : '↩ Reopen'}
                      </button>
                      <button
                        style={{ padding: '7px 10px', fontSize: 12 }}
                        onClick={() => setConfirmDelete(g._id)}
                        title="Delete goal"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {listStatus === 'succeeded' && visibleGoals.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  {filter === 'all' && !search.trim() ? 'No goals yet' : 'No matching goals'}
                </div>
                <div style={{ fontSize: 14 }}>
                  {filter === 'all' && !search.trim()
                    ? 'Add your first goal above to get started.'
                    : 'Try adjusting your filters or search.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: 12, marginBottom: 18,
            }}>
              <div className="section-title">Edit Goal</div>
              <button style={{ padding: '6px 12px', fontSize: 13 }} onClick={closeEdit}>
                ✕ Close
              </button>
            </div>
            <form onSubmit={saveEdit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="label">Title</label>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add more detail about this goal…"
                />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label">Category</label>
                  <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="label">Due Date</label>
                  <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                gap: 10, flexWrap: 'wrap', marginTop: 4,
              }}>
                <button
                  type="button"
                  style={{ fontSize: 13, padding: '8px 14px' }}
                  onClick={() => setEditDueDate('')}
                >
                  Clear due date
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '11px 24px', fontWeight: 700 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}
    </div>
  )
}
