import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import {
  createGoal, deleteGoal, fetchAnalytics, fetchGoals, updateGoal,
} from '../features/goals/goalsSlice'
import TodayView from '../components/TodayView'
import BoardView from '../components/BoardView'
import AnalyticsTab from '../components/AnalyticsTab'
import AiCoachTab from '../components/AiCoachTab'
import ShareTab from '../components/ShareTab'
import EditGoalModal from '../components/EditGoalModal'
import ProfileModal from '../components/ProfileModal'
import MobileMenu from '../components/MobileMenu'
import FeatureTour from '../components/FeatureTour'
import { ThemeSwitch } from '../components/ThemeControls'
import { ConnectionBanner } from '../components/StateViews'
import {
  IconChart, IconHelp, IconLink, IconLogout, IconSpark, IconTarget,
} from '../components/icons'
import { IconMenu, IconSunrise as IconToday } from '../components/icons2'

const VIEWS = [
  { id: 'today', label: 'Today', Icon: IconToday, desc: 'What needs you now' },
  { id: 'board', label: 'Board', Icon: IconTarget, desc: 'Every goal' },
  { id: 'progress', label: 'Progress', Icon: IconChart, desc: 'Streaks and trends' },
  { id: 'coach', label: 'Coach', Icon: IconSpark, desc: 'Claude suggests goals' },
  { id: 'share', label: 'Share', Icon: IconLink, desc: 'Public link' },
]

function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
      <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const greetingFor = (h) => {
  if (h < 5) return 'Still up'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Winding down'
}

// Re-reads the clock every minute so the greeting is never stale
function useGreeting() {
  const [greeting, setGreeting] = useState(() => greetingFor(new Date().getHours()))
  useEffect(() => {
    const id = setInterval(() => setGreeting(greetingFor(new Date().getHours())), 60000)
    return () => clearInterval(id)
  }, [])
  return greeting
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items, listStatus, createStatus, error, stats } = useSelector((s) => s.goals)

  const [view, setView] = useState('today')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('smart')
  const [editing, setEditing] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const greeting = useGreeting()
  const [online, setOnline] = useState(() => navigator.onLine)
  const [waking, setWaking] = useState(false)

  const searchRef = useRef(null)
  const toastTimer = useRef(null)

  const load = useCallback(() => {
    dispatch(fetchGoals())
    dispatch(fetchAnalytics(90))
  }, [dispatch])

  useEffect(() => {
    document.title = 'Goalsetter+ | Today'
    load()
  }, [load])

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  // Free-tier servers sleep. If the first load drags, say so instead of
  // showing an empty board.
  useEffect(() => {
    if (listStatus !== 'loading') return undefined
    const t = setTimeout(() => setWaking(true), 2500)
    return () => {
      clearTimeout(t)
      setWaking(false)
    }
  }, [listStatus])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = useCallback((msg, tone = 'ok') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, tone })
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => {
    if (listStatus !== 'succeeded') return undefined
    const isDemo = user?.email === 'demo@goalsetter.app'
    const seenThisSession = sessionStorage.getItem('gs-tour-session')
    const seenEver = localStorage.getItem('gs-tour-done')
    const shouldRun = isDemo ? !seenThisSession : !seenEver
    if (!shouldRun) return undefined
    const t = setTimeout(() => setTourOpen(true), 800)
    return () => clearTimeout(t)
  }, [listStatus, user])

  const closeTour = useCallback(() => {
    setTourOpen(false)
    localStorage.setItem('gs-tour-done', '1')
    sessionStorage.setItem('gs-tour-session', '1')
  }, [])

  /* Shortcuts: N to add, / to search */
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || editing || menuOpen) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setView('today')
        setTimeout(() => document.querySelector('.qa-input')?.focus(), 60)
      }
      if (e.key === '/') {
        e.preventDefault()
        setView('board')
        setTimeout(() => searchRef.current?.focus(), 60)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editing, menuOpen])

  /* Mutations: the UI moves immediately, the slice rolls back on failure */
  const handleCreate = async (payload) => {
    showToast('Goal added')
    const res = await dispatch(createGoal(payload))
    if (createGoal.rejected.match(res)) showToast(res.payload || 'Could not add that goal', 'err')
  }

  const handleToggle = async (goal) => {
    const next = goal.status === 'active' ? 'completed' : 'active'
    showToast(next === 'completed' ? 'Nice. One more link in the chain.' : 'Reopened')
    const res = await dispatch(updateGoal({ id: goal._id, updates: { status: next } }))
    if (updateGoal.rejected.match(res)) showToast(res.payload || 'Could not save that', 'err')
    else dispatch(fetchAnalytics(90))
  }

  const handleToggleSubtask = async (goal, index) => {
    const subtasks = (goal.subtasks || []).map((s, i) =>
      i === index ? { ...s, completed: !s.completed } : s
    )
    const res = await dispatch(updateGoal({ id: goal._id, updates: { subtasks } }))
    if (updateGoal.rejected.match(res)) showToast(res.payload || 'Could not save that step', 'err')
  }

  const handleDelete = async (goal) => {
    showToast('Goal deleted')
    const res = await dispatch(deleteGoal(goal._id))
    if (deleteGoal.rejected.match(res)) showToast(res.payload || 'Could not delete that goal', 'err')
  }

  const handleSaveEdit = async (updates) => {
    const target = editing
    setEditing(null)
    showToast('Saved')
    const res = await dispatch(updateGoal({ id: target._id, updates }))
    if (updateGoal.rejected.match(res)) showToast(res.payload || 'Could not save changes', 'err')
    else if (updates.status === 'completed' && target.status !== 'completed') dispatch(fetchAnalytics(90))
  }

  const goalHandlers = {
    onToggle: handleToggle,
    onEdit: setEditing,
    onDelete: handleDelete,
    onToggleSubtask: handleToggleSubtask,
  }

  const firstName = user?.name ? user.name.split(' ')[0] : null
  const focusCount = stats.overdue + items.filter((g) => {
    if (g.status !== 'active' || !g.dueDate) return false
    const d = new Date(g.dueDate).toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
    return d === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
  }).length

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>

      <div className="app-top">
      <header className="app-header">
        <div className="app-header-in">
          <div className="brand-wrap">
            <BrandMark />
            <h1 className="brand-h1">Goalsetter<span className="plus">+</span></h1>
          </div>

          <div className="greet">
            <p className="greet-line">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </p>
            <p className="greet-sub">
              {listStatus === 'failed'
                ? 'Goals not loaded'
                : listStatus !== 'succeeded'
                  ? 'Loading your board'
                  : focusCount > 0
                    ? <><span className="greet-count">{focusCount}</span> {focusCount === 1 ? 'goal needs you today' : 'goals need you today'}</>
                    : 'You are clear today'}
            </p>
          </div>

          <div className="header-actions desktop-only">
            <button className="tour-btn" onClick={() => setTourOpen(true)} title="Take the guided tour">
              <IconHelp size={17} />
              <span>Tour</span>
            </button>
            <ThemeSwitch />
            <button
              className="avatar avatar-btn"
              onClick={() => setProfileOpen(true)}
              aria-label="Profile and account"
            >
              {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
            </button>
            <button className="icon-btn" onClick={() => dispatch(logout())} aria-label="Sign out" title="Sign out">
              <IconLogout size={17} />
            </button>
          </div>

          <button className="icon-btn mobile-only menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <IconMenu size={20} />
          </button>
        </div>

      </header>

      <nav className="viewnav" aria-label="Sections">
        <ul>
          {VIEWS.map((v) => (
            <li key={v.id}>
              <button
                data-tour={`tab-${v.id}`}
                className={`vtab${view === v.id ? ' is-on' : ''}`}
                aria-current={view === v.id ? 'page' : undefined}
                onClick={() => {
                  setView(v.id)
                  if (v.id === 'progress') dispatch(fetchAnalytics(90))
                }}
              >
                <v.Icon size={17} />
                <span className="vtab-l">{v.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      </div>

      <main id="main" className="app-main">
        <ConnectionBanner offline={!online} waking={waking} onRetry={load} />

        {view === 'today' && (
          <TodayView
            goals={items}
            listStatus={listStatus}
            error={error}
            onRetry={load}
            onCreate={handleCreate}
            createBusy={createStatus === 'loading'}
            {...goalHandlers}
          />
        )}

        {view === 'board' && (
          <BoardView
            goals={items}
            listStatus={listStatus}
            error={error}
            onRetry={load}
            stats={stats}
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchRef={searchRef}
            {...goalHandlers}
          />
        )}

        {view === 'progress' && <AnalyticsTab />}
        {view === 'coach' && <AiCoachTab onToast={showToast} />}
        {view === 'share' && <ShareTab onToast={showToast} />}
      </main>

      {/* Screen readers hear every optimistic action and every rollback */}
      <div className="sr-only" role="status" aria-live="polite">{toast?.msg || ''}</div>

      {toast && (
        <output className={`toast${toast.tone === 'err' ? ' is-err' : ''}`}>
          <span className={`led${toast.tone === 'err' ? ' red' : ''}`} />
          {toast.msg}
        </output>
      )}

      {editing && (
        <EditGoalModal goal={editing} onClose={() => setEditing(null)} onSave={handleSaveEdit} />
      )}
      {profileOpen && user && (
        <ProfileModal user={user} onClose={() => setProfileOpen(false)} onToast={showToast} />
      )}
      {menuOpen && (
        <MobileMenu
          user={user}
          onClose={() => setMenuOpen(false)}
          onProfile={() => setProfileOpen(true)}
          onTour={() => setTourOpen(true)}
          onSignOut={() => dispatch(logout())}
        />
      )}
      {tourOpen && <FeatureTour onDone={closeTour} />}
    </div>
  )
}
