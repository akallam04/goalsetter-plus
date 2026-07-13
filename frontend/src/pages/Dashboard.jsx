import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import {
  createGoal, deleteGoal, fetchGoals,
  fetchAnalytics, setFilter, updateGoal,
} from '../features/goals/goalsSlice'
import { buildDayMap, currentStreak } from '../lib/insights'
import GoalCard from '../components/GoalCard'
import NewGoalForm from '../components/NewGoalForm'
import EditGoalModal from '../components/EditGoalModal'
import AnalyticsTab from '../components/AnalyticsTab'
import AiCoachTab from '../components/AiCoachTab'
import ShareTab from '../components/ShareTab'
import ProfileModal from '../components/ProfileModal'
import ProgressRing from '../components/ProgressRing'
import ThemeControls from '../components/ThemeControls'
import {
  IconChart, IconFlame, IconLink, IconLogout, IconPlus,
  IconSearch, IconSpark, IconTarget, IconX,
} from '../components/icons'

const TABS = [
  { id: 'goals', label: 'Goals', desc: 'Plan and track your board', Icon: IconTarget },
  { id: 'analytics', label: 'Analytics', desc: 'Streaks, momentum, trends', Icon: IconChart },
  { id: 'ai', label: 'AI Coach', desc: 'Claude builds SMART goals', Icon: IconSpark },
  { id: 'share', label: 'Share', desc: 'Public read-only link', Icon: IconLink },
]

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

// Urgency-first ordering: overdue and due-soon goals surface to the top,
// undated goals rank by priority, completed goals sink to the bottom.
const smartCompare = (a, b) => {
  const aDone = a.status === 'completed'
  const bDone = b.status === 'completed'
  if (aDone !== bDone) return aDone ? 1 : -1
  if (aDone) return new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
  const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
  const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
  if (aDue !== bDue) return aDue - bDue
  const pDiff = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
  if (pDiff !== 0) return pDiff
  return new Date(b.createdAt) - new Date(a.createdAt)
}

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  return (
    <span className="clock">
      {hh}<span className="tick">:</span>{mm}<span className="sec"><span className="tick">:</span>{ss}</span>
    </span>
  )
}

function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
      <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items, listStatus, createStatus, error, filter, stats, analytics } = useSelector((s) => s.goals)

  const [activeTab, setActiveTab] = useState('goals')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('smart')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [justDoneId, setJustDoneId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const titleInputRef = useRef(null)
  const searchInputRef = useRef(null)
  const toastTimer = useRef(null)
  const doneTimer = useRef(null)
  const pageRef = useRef(null)
  const spotRaf = useRef(0)

  // Cursor spotlight: writes CSS vars directly, no re-renders
  const onSpotlight = (e) => {
    const { clientX, clientY } = e
    cancelAnimationFrame(spotRaf.current)
    spotRaf.current = requestAnimationFrame(() => {
      pageRef.current?.style.setProperty('--mx', `${clientX}px`)
      pageRef.current?.style.setProperty('--my', `${clientY}px`)
    })
  }

  useEffect(() => {
    document.title = 'Goalsetter+ | Dashboard'
    dispatch(fetchGoals())
    dispatch(fetchAnalytics(90))
  }, [dispatch])

  useEffect(() => () => {
    clearTimeout(toastTimer.current)
    clearTimeout(doneTimer.current)
    cancelAnimationFrame(spotRaf.current)
  }, [])

  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  /* Keyboard: N = new goal, / = search, Esc = close sheet */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSheetOpen(false)
        return
      }
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editing) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setActiveTab('goals')
        if (window.innerWidth <= 860) {
          setSheetOpen(true)
        } else {
          titleInputRef.current?.focus()
          titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      if (e.key === '/') {
        e.preventDefault()
        setActiveTab('goals')
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editing])

  /* Actions */
  const handleCreate = async (payload) => {
    const res = await dispatch(createGoal(payload))
    if (createGoal.fulfilled.match(res)) {
      showToast('Goal set. Go get it.')
      setSheetOpen(false)
      return true
    }
    return false
  }

  const handleToggle = async (g) => {
    const next = g.status === 'active' ? 'completed' : 'active'
    await dispatch(updateGoal({ id: g._id, updates: { status: next } }))
    if (next === 'completed') {
      setJustDoneId(g._id)
      clearTimeout(doneTimer.current)
      doneTimer.current = setTimeout(() => setJustDoneId(null), 800)
      dispatch(fetchAnalytics(90))
      showToast('Completed. Nice work.')
    } else {
      showToast('Goal reopened')
    }
  }

  const handleDelete = async (id) => {
    await dispatch(deleteGoal(id))
    setConfirmDelete(null)
    showToast('Goal deleted', 'error')
  }

  const handleSaveEdit = async (updates) => {
    await dispatch(updateGoal({ id: editing._id, updates }))
    if (updates.status === 'completed' && editing.status !== 'completed') {
      dispatch(fetchAnalytics(90))
    }
    setEditing(null)
    showToast('Changes saved')
  }

  const switchTab = (id) => {
    setActiveTab(id)
    if (id === 'analytics') dispatch(fetchAnalytics(90))
  }

  /* Derived */
  const visibleGoals = useMemo(() => {
    let result = [...items]
    if (filter !== 'all') result = result.filter((g) => g.status === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((g) =>
        g.title.toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      if (sortBy === 'smart') return smartCompare(a, b)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'dueSoon') {
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return aDue - bDue
      }
      if (sortBy === 'priorityHigh')
        return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return result
  }, [items, filter, search, sortBy])

  const streak = useMemo(
    () => currentStreak(buildDayMap(analytics.completionsByDay)),
    [analytics.completionsByDay]
  )

  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const firstName = user?.name ? user.name.split(' ')[0] : null

  const dateLine = new Date().toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  }).toUpperCase()

  const filterPills = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'completed', label: 'Done', count: stats.completed },
  ]

  return (
    <div className="page app-frame" ref={pageRef} onMouseMove={onSpotlight}>
      <div className="shell">

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="brand">
              <BrandMark />
              <span>Goalsetter<span className="plus">+</span></span>
              <span className="brand-chip">V2</span>
            </div>
            <div className="top-sub">
              <span>{dateLine}</span>
              {firstName && (
                <span className="sub-grp hide-sm">
                  <span className="sep">/</span>
                  <span>OPERATOR: {firstName.toUpperCase()}</span>
                </span>
              )}
              <span className="sep">/</span>
              <span style={{ color: stats.overdue > 0 ? 'var(--red)' : undefined }}>
                {stats.overdue > 0 ? `${stats.overdue} OVERDUE` : 'ON TRACK'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeControls />
            <Clock />
            <button
              className="avatar avatar-btn"
              onClick={() => setProfileOpen(true)}
              aria-label="Edit profile"
              title="Edit profile"
            >
              {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
            </button>
            <button className="icon-btn" onClick={() => dispatch(logout())} aria-label="Sign out" title="Sign out">
              <IconLogout size={17} />
            </button>
          </div>
        </div>

        {/* Telemetry strip */}
        <div className="telemetry">
          <div className="t-cell">
            <span className="t-num">{stats.total}</span>
            <span className="t-lbl">Total</span>
          </div>
          <div className="t-cell">
            <span className="t-num" style={{ color: 'var(--acc)' }}>{stats.active}</span>
            <span className="t-lbl"><span className="led" />Active</span>
          </div>
          <div className="t-cell">
            <span className="t-num">{stats.completed}</span>
            <span className="t-lbl">Done</span>
          </div>
          <div className="t-cell">
            <span className="t-num" style={{ color: stats.overdue > 0 ? 'var(--red)' : 'var(--dim)' }}>
              {stats.overdue}
            </span>
            <span className="t-lbl">
              {stats.overdue > 0 && <span className="led red pulse" />}Overdue
            </span>
          </div>
          <div className="t-cell" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ProgressRing value={rate} size={42} stroke={4} />
            <span className="t-lbl">Rate</span>
          </div>
          <div className="t-cell">
            <span className="t-num" style={{ display: 'flex', alignItems: 'center', gap: 7, color: streak > 0 ? 'var(--amber)' : 'var(--dim)' }}>
              {streak > 0 && <IconFlame size={18} />}{streak}
            </span>
            <span className="t-lbl">Day streak</span>
          </div>
        </div>

        {/* Desktop tabs */}
        <div className="seg">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`seg-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => switchTab(t.id)}
            >
              <span className="ic"><t.Icon size={17} /></span>
              <span className="seg-txt">
                <span className="lbl">{t.label}</span>
                <span className="dsc">{t.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="tab-viewport">
          {/* Goals */}
          {activeTab === 'goals' && (
            <div className="pane goals-grid">
              {/* New goal: desktop panel */}
              <div className="panel panel-tick desktop-only gform-panel">
                <div className="panel-head" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="mono-label" style={{ marginBottom: 3 }}>New entry</div>
                    <div className="section-title">Set a Goal</div>
                  </div>
                  <kbd>N</kbd>
                </div>
                <NewGoalForm
                  onCreate={handleCreate}
                  creating={createStatus === 'loading'}
                  error={error}
                  titleRef={titleInputRef}
                />
              </div>

              {/* Goal list */}
              <div className="panel glist-panel">
                {stats.overdue > 0 && filter !== 'active' && (
                  <button
                    className="alert-strip"
                    style={{ marginBottom: 12 }}
                    onClick={() => { dispatch(setFilter('active')); setSortBy('smart') }}
                  >
                    <span className="led red pulse" />
                    {stats.overdue} {stats.overdue === 1 ? 'GOAL NEEDS' : 'GOALS NEED'} ATTENTION
                    <span style={{ marginLeft: 'auto', opacity: 0.75 }}>REVIEW</span>
                  </button>
                )}

                <div className="filter-row" style={{ marginBottom: 14 }}>
                  {filterPills.map((f) => (
                    <button
                      key={f.id}
                      className={`pill${filter === f.id ? ' active' : ''}`}
                      onClick={() => dispatch(setFilter(f.id))}
                    >
                      {f.label}<span className="count">{f.count}</span>
                    </button>
                  ))}
                  <div className="search-wrap">
                    <IconSearch size={14} />
                    <input
                      ref={searchInputRef}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search goals"
                      aria-label="Search goals"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort goals"
                    style={{ width: 'auto', padding: '7px 11px', fontSize: 12.5 }}
                  >
                    <option value="smart">Smart sort</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="dueSoon">Due soon</option>
                    <option value="priorityHigh">Priority</option>
                  </select>
                </div>

                <div className="glist-scroll">
                  {listStatus === 'loading' && items.length === 0 && (
                    <>
                      <div className="skel" style={{ height: 86 }} />
                      <div className="skel" style={{ height: 86 }} />
                      <div className="skel" style={{ height: 86 }} />
                    </>
                  )}

                  {visibleGoals.map((g) => (
                    <GoalCard
                      key={g._id}
                      goal={g}
                      confirmingDelete={confirmDelete === g._id}
                      justDone={justDoneId === g._id}
                      onEdit={() => setEditing(g)}
                      onToggle={() => handleToggle(g)}
                      onAskDelete={() => setConfirmDelete(g._id)}
                      onCancelDelete={() => setConfirmDelete(null)}
                      onConfirmDelete={() => handleDelete(g._id)}
                    />
                  ))}

                  {listStatus === 'succeeded' && visibleGoals.length === 0 && (
                    <div className="empty">
                      <IconTarget size={34} />
                      <div className="empty-title">
                        {filter === 'all' && !search.trim() ? 'No goals on the board' : 'Nothing matches'}
                      </div>
                      <div className="empty-sub">
                        {filter === 'all' && !search.trim()
                          ? 'Set your first goal and start building momentum.'
                          : 'Try a different filter or search term.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="pane pane-scroll"><AnalyticsTab /></div>
          )}

          {/* AI Coach */}
          {activeTab === 'ai' && (
            <div className="pane pane-scroll"><AiCoachTab onToast={showToast} /></div>
          )}

          {/* Share */}
          {activeTab === 'share' && (
            <div className="pane pane-scroll"><ShareTab onToast={showToast} /></div>
          )}
        </div>

        <div
          className="mono mobile-only"
          style={{ textAlign: 'center', fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--dim)', marginTop: 14 }}
        >
          GOALSETTER+ V2 · REACT 19 · CLAUDE AI
        </div>
      </div>

      {/* Mobile: FAB + bottom nav */}
      {activeTab === 'goals' && (
        <button className="fab" onClick={() => setSheetOpen(true)} aria-label="New goal">
          <IconPlus size={24} />
        </button>
      )}

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`bnav-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <t.Icon size={19} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Mobile new-goal sheet */}
      {sheetOpen && (
        <div className="modal-overlay" onClick={() => setSheetOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="panel-head" style={{ marginBottom: 14 }}>
              <div>
                <div className="mono-label" style={{ marginBottom: 3 }}>New entry</div>
                <div className="section-title">Set a Goal</div>
              </div>
              <button className="icon-btn" onClick={() => setSheetOpen(false)} aria-label="Close">
                <IconX size={17} />
              </button>
            </div>
            <div className="modal-body">
              <NewGoalForm
                onCreate={handleCreate}
                creating={createStatus === 'loading'}
                error={error}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditGoalModal
          goal={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Profile modal */}
      {profileOpen && user && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span className={`led ${toast.type === 'error' ? 'red' : ''}`} />
          {toast.msg}
        </div>
      )}
    </div>
  )
}
