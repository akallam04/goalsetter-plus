import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { logout } from '../features/auth/authSlice'
import {
  createGoal, deleteGoal, fetchGoals, fetchStats,
  fetchAnalytics, setFilter, updateGoal,
} from '../features/goals/goalsSlice'

const CHART_COLORS = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6']
const TOOLTIP_STYLE = {
  background: '#111827', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10, color: '#f1f5f9', fontSize: 13,
}
const fillDays = (data, days) => {
  const map = Object.fromEntries(data.map((d) => [d._id, d.count]))
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const key   = d.toLocaleDateString('en-CA')
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return { date: label, count: map[key] || 0 }
  })
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items, listStatus, createStatus, error, filter, stats, analytics, analyticsStatus } = useSelector((s) => s.goals)
  const [analyticsDays, setAnalyticsDays] = useState(30)

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
  const [editNotes, setEditNotes]           = useState('')
  const [editSubtasks, setEditSubtasks]     = useState([])
  const [newSubtask, setNewSubtask]         = useState('')

  // UX state
  const [toast, setToast]                 = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Ref for keyboard shortcut N → focus title input
  const titleInputRef = useRef(null)

  useEffect(() => {
    dispatch(fetchGoals())
    dispatch(fetchStats())
    dispatch(fetchAnalytics(30))
  }, [dispatch])

  const switchAnalyticsDays = (d) => {
    setAnalyticsDays(d)
    dispatch(fetchAnalytics(d))
  }

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
    setEditNotes(g.notes || '')
    setEditSubtasks(g.subtasks ? g.subtasks.map((s) => ({ ...s })) : [])
  }

  const closeEdit = () => {
    setEditing(null)
    setEditTitle('')
    setEditCategory('')
    setEditPriority('medium')
    setEditDueDate('')
    setEditStatus('active')
    setEditDescription('')
    setEditNotes('')
    setEditSubtasks([])
    setNewSubtask('')
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editing || !editTitle.trim()) return
    // Strip frontend-only localId before sending
    const subtasksPayload = editSubtasks.map(({ localId, ...rest }) => rest)

    await dispatch(updateGoal({
      id: editing._id,
      updates: {
        title: editTitle,
        category: editCategory,
        priority: editPriority,
        status: editStatus,
        description: editDescription,
        notes: editNotes,
        subtasks: subtasksPayload,
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

  const daysUntilDue = (g) => {
    if (!g.dueDate || g.status !== 'active') return null
    const mst = { timeZone: 'America/Denver' }
    const dueStr   = new Date(g.dueDate).toLocaleDateString('en-CA', mst)
    const todayStr = new Date().toLocaleDateString('en-CA', mst)
    const diff     = Math.round((new Date(dueStr) - new Date(todayStr)) / 86400000)
    return diff
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setEditSubtasks((prev) => [
      ...prev,
      { localId: Date.now(), text: newSubtask.trim(), completed: false },
    ])
    setNewSubtask('')
  }

  const toggleSubtask = (index) => {
    setEditSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s))
    )
  }

  const removeSubtask = (index) => {
    setEditSubtasks((prev) => prev.filter((_, i) => i !== index))
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

        {/* ── Main 2-column: [Left: Add Goal + Filter] | [Right: Charts] ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16 }} className="main-grid">

          {/* LEFT: Add Goal + Filter & Sort stacked */}
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>

            {/* Add Goal */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
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
                    <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Career" />
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
                  {error ? <div style={{ color: '#fca5a5', fontSize: 13 }}>{error}</div> : <div />}
                  <button type="submit" className="btn-primary" style={{ padding: '11px 28px', fontWeight: 700, fontSize: 15 }} disabled={createStatus === 'loading'}>
                    {createStatus === 'loading' ? 'Adding…' : '+ Add Goal'}
                  </button>
                </div>
              </form>
            </div>

            {/* Filter & Sort */}
            <div className="card" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
              <div className="section-title">Filter &amp; Sort</div>
              <div>
                <label className="label">Status</label>
                <div className="filter-group">
                  {['all', 'active', 'completed'].map((f) => (
                    <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => dispatch(setFilter(f))} style={{ textTransform: 'capitalize' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Search</label>
                <div className="search-wrap">
                  <span className="search-icon">⌕</span>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…" />
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

          {/* RIGHT: Charts stacked */}
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>

            {/* Category breakdown */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 12 }}>Goals by category</div>
              {analyticsStatus === 'loading' && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted2)', fontSize: 13 }}>Loading…</div>
              )}
              {analyticsStatus === 'succeeded' && analytics.byCategory.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted2)', fontSize: 13 }}>Add goals to see breakdown</div>
              )}
              {analyticsStatus === 'succeeded' && analytics.byCategory.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics.byCategory.map((c) => ({ name: c._id, value: c.total }))}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value"
                    >
                      {analytics.byCategory.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--muted)', fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Completions over time */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-title">Goals completed</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[7, 30].map((d) => (
                    <button key={d} className={`filter-btn${analyticsDays === d ? ' active' : ''}`} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => switchAnalyticsDays(d)}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              {analyticsStatus === 'loading' && (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted2)', fontSize: 13 }}>Loading…</div>
              )}
              {analyticsStatus === 'succeeded' && (
                <ResponsiveContainer width="100%" height={170}>
                  <LineChart data={fillDays(analytics.completionsByDay, analyticsDays)} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={analyticsDays === 7 ? 0 : 'preserveStartEnd'} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                    <Line type="monotone" dataKey="count" name="Completed" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#a78bfa' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
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
                    {(() => {
                      const d = daysUntilDue(g)
                      if (d === null || d < 0) return null
                      if (d === 0) return <span className="badge badge-overdue">Due today</span>
                      if (d <= 7) return <span className="badge badge-medium">in {d}d</span>
                      return null
                    })()}
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
            <form onSubmit={saveEdit} style={{ display: 'grid', gap: 14, maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
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

              {/* Sub-tasks */}
              <div>
                <label className="label">Sub-tasks</label>
                <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
                  {editSubtasks.map((s, i) => (
                    <div key={s._id || s.localId} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                    }}>
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => toggleSubtask(i)}
                        style={{ width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0 }}
                      />
                      <span style={{
                        flex: 1, fontSize: 13,
                        textDecoration: s.completed ? 'line-through' : 'none',
                        color: s.completed ? 'var(--muted2)' : 'var(--text)',
                      }}>
                        {s.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSubtask(i)}
                        style={{ padding: '2px 7px', fontSize: 11, opacity: 0.6 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                    placeholder="Add a sub-task… (Enter to add)"
                    style={{ fontSize: 13 }}
                  />
                  <button type="button" onClick={addSubtask} style={{ padding: '9px 14px', fontSize: 13, flexShrink: 0 }}>
                    + Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Any notes, links, or context for this goal…"
                  rows={3}
                  style={{
                    width: '100%', resize: 'vertical', minHeight: 72,
                    background: 'rgba(0,0,0,0.32)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '11px 14px',
                    outline: 'none', color: 'var(--text)', fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124,58,237,0.6)'
                    e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = ''
                    e.target.style.boxShadow = ''
                  }}
                />
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                gap: 10, flexWrap: 'wrap', paddingTop: 4,
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
