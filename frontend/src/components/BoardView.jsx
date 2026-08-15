import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import GoalCard from './GoalCard'
import { EmptyState, ErrorState, GoalSkeleton } from './StateViews'
import { setFilter } from '../features/goals/goalsSlice'
import { IconSearch } from './icons'

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

const smartCompare = (a, b) => {
  const aDone = a.status === 'completed'
  const bDone = b.status === 'completed'
  if (aDone !== bDone) return aDone ? 1 : -1
  if (aDone) return new Date(b.completedAt || 0) - new Date(a.completedAt || 0)
  const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
  const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
  if (aDue !== bDue) return aDue - bDue
  const p = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
  return p !== 0 ? p : new Date(b.createdAt) - new Date(a.createdAt)
}

// The full board: everything, with the controls people expect when
// they are managing rather than doing.
export default function BoardView({
  goals, listStatus, error, onRetry, stats,
  search, setSearch, sortBy, setSortBy, searchRef,
  onToggle, onEdit, onDelete, onToggleSubtask,
}) {
  const dispatch = useDispatch()
  const filter = useSelector((s) => s.goals.filter)

  const visible = useMemo(() => {
    let out = [...goals]
    if (filter !== 'all') out = out.filter((g) => g.status === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter((g) => g.title.toLowerCase().includes(q) || (g.category || '').toLowerCase().includes(q))
    }
    out.sort((a, b) => {
      if (sortBy === 'smart') return smartCompare(a, b)
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === 'dueSoon') {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
        return ad - bd
      }
      if (sortBy === 'priorityHigh') return (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return out
  }, [goals, filter, search, sortBy])

  const pills = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'completed', label: 'Done', count: stats.completed },
  ]

  return (
    <div className="board">
      <div className="board-controls">
        <div className="seg-pills" role="group" aria-label="Filter goals">
          {pills.map((p) => (
            <button
              key={p.id}
              className={`fpill${filter === p.id ? ' is-on' : ''}`}
              aria-pressed={filter === p.id}
              onClick={() => dispatch(setFilter(p.id))}
            >
              {p.label} <span className="fpill-n">{p.count}</span>
            </button>
          ))}
        </div>
        <div className="board-tools">
          <div className="search-wrap">
            <IconSearch size={15} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search goals"
              aria-label="Search goals"
              type="search"
            />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort goals" className="board-sort">
            <option value="smart">Smart order</option>
            <option value="dueSoon">Due soonest</option>
            <option value="priorityHigh">Priority</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {listStatus === 'failed' && <ErrorState message={error} onRetry={onRetry} />}
      {listStatus === 'loading' && goals.length === 0 && <GoalSkeleton rows={4} />}

      {listStatus === 'succeeded' && visible.length === 0 && (
        <EmptyState
          title={filter === 'all' && !search.trim() ? 'No goals yet' : 'Nothing matches'}
          sub={filter === 'all' && !search.trim() ? 'Add one from the Today tab.' : 'Try another filter or search term.'}
        />
      )}

      {visible.length > 0 && (
        <ul className="gc-list">
          {visible.map((g) => (
            <GoalCard
              key={g._id}
              goal={g}
              onToggle={() => onToggle(g)}
              onEdit={() => onEdit(g)}
              onDelete={() => onDelete(g)}
              onToggleSubtask={(i) => onToggleSubtask(g, i)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
