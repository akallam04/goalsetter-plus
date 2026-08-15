import { memo, useEffect, useRef, useState } from 'react'
import { dueSentence, formatDate, isOverdue, prettyClock } from '../lib/dates'
import { IconCheck, IconPencil, IconTrash, IconUndo } from './icons'
import { IconChevron, IconMore } from './icons2'

// One goal. The primary daily action (complete) is a single large target;
// everything rarer lives behind the overflow menu so the row stays short.
function GoalCard({ goal, onToggle, onEdit, onDelete, onToggleSubtask }) {
  const [subsOpen, setSubsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef(null)

  const done = goal.status === 'completed'
  const overdue = isOverdue(goal)
  const phrase = dueSentence(goal)
  const subs = goal.subtasks || []
  const subsDone = subs.filter((s) => s.completed).length

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setMenuOpen(false); setConfirming(false) } }
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setConfirming(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <li className={`gc${done ? ' is-done' : ''}${goal.pending ? ' is-pending' : ''}${overdue ? ' is-overdue' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <button
        className="gc-check"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Reopen ${goal.title}` : `Mark ${goal.title} complete`}
      >
        {done ? <IconUndo size={16} /> : <IconCheck size={17} />}
      </button>

      <div className="gc-body">
        <p className="gc-title">{goal.title}</p>
        {goal.description && <p className="gc-desc">{goal.description}</p>}

        <div className="gc-meta">
          <span className={`prio prio-${goal.priority}`} title={`${goal.priority} priority`}>
            <span className="prio-dot" />{goal.priority}
          </span>
          <span className="gc-cat">{goal.category}</span>
          {phrase && !done && (
            <span className={`gc-due${overdue ? ' is-late' : ''}`}>{phrase}</span>
          )}
          {done && goal.completedAt && (
            <span className="gc-due">Done {formatDate(goal.completedAt)}</span>
          )}
        </div>

        {subs.length > 0 && (
          <>
            <button
              className="gc-subs-toggle"
              onClick={() => setSubsOpen((v) => !v)}
              aria-expanded={subsOpen}
            >
              <span className="gc-bar" aria-hidden="true">
                <span className="gc-bar-fill" style={{ width: `${(subsDone / subs.length) * 100}%` }} />
              </span>
              <span className="gc-subs-count">{subsDone}/{subs.length} steps</span>
              <IconChevron size={13} className={subsOpen ? 'flip' : ''} />
            </button>

            {subsOpen && (
              <ul className="gc-subs">
                {subs.map((s, i) => (
                  <li key={s._id || i}>
                    <label className="gc-sub">
                      <input
                        type="checkbox"
                        checked={!!s.completed}
                        onChange={() => onToggleSubtask(i)}
                      />
                      <span className={s.completed ? 'is-checked' : ''}>{s.text}</span>
                      {s.time && <span className="gc-sub-time">{prettyClock(s.time)}</span>}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="gc-menu" ref={menuRef}>
        <button
          className="gc-menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`Actions for ${goal.title}`}
        >
          <IconMore size={16} />
        </button>
        {menuOpen && (
          <div className="menu-pop" role="menu">
            <button role="menuitem" onClick={() => { setMenuOpen(false); onEdit() }}>
              <IconPencil size={14} /> Edit details
            </button>
            {confirming ? (
              <button role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); setConfirming(false); onDelete() }}>
                <IconTrash size={14} /> Tap again to delete
              </button>
            ) : (
              <button role="menuitem" className="is-danger" onClick={() => setConfirming(true)}>
                <IconTrash size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export default memo(GoalCard)
