import { memo } from 'react'
import { formatDate, isOverdue, dueLabel } from '../lib/dates'
import { IconCheck, IconPencil, IconTrash, IconUndo, IconX } from './icons'

function GoalCard({ goal, confirmingDelete, justDone, onEdit, onToggle, onAskDelete, onCancelDelete, onConfirmDelete }) {
  const done = goal.status === 'completed'
  const overdue = isOverdue(goal)
  const countdown = dueLabel(goal)
  const subs = goal.subtasks || []
  const subsDone = subs.filter((s) => s.completed).length

  return (
    <div
      className={[
        'gcard',
        `p-${goal.priority}`,
        done ? 'done' : '',
        justDone ? 'just-done' : '',
        'fade-in',
      ].filter(Boolean).join(' ')}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="gcard-title">{goal.title}</div>
        {goal.description && <div className="gcard-desc">{goal.description}</div>}

        <div className="gcard-meta">
          <span className={`chip chip-${goal.priority}`}>
            <span className="dot" />{goal.priority}
          </span>
          <span className="chip">{goal.category}</span>
          {goal.dueDate && (
            <span className={`chip ${overdue ? 'chip-overdue' : ''}`}>
              {formatDate(goal.dueDate)}
            </span>
          )}
          {!done && countdown && (
            <span className={`chip ${overdue ? 'chip-overdue' : countdown === 'due today' ? 'chip-medium' : 'chip-acc'}`}>
              {countdown}
            </span>
          )}
          {done && <span className="chip chip-done">archived</span>}
        </div>

        {subs.length > 0 && (
          <div className="sub-progress">
            <div className="track">
              <div className="fill" style={{ width: `${(subsDone / subs.length) * 100}%` }} />
            </div>
            <span className="txt">{subsDone}/{subs.length} SUBTASKS</span>
          </div>
        )}
      </div>

      <div className="gcard-actions">
        {confirmingDelete ? (
          <>
            <button className="btn-danger" style={{ padding: '7px 13px', fontSize: 12 }} onClick={onConfirmDelete}>
              Delete
            </button>
            <button className="icon-btn" onClick={onCancelDelete} aria-label="Cancel delete">
              <IconX />
            </button>
          </>
        ) : (
          <>
            <button className="icon-btn" onClick={onEdit} aria-label="Edit goal" title="Edit">
              <IconPencil />
            </button>
            <button
              className="icon-btn acc"
              onClick={onToggle}
              aria-label={done ? 'Reopen goal' : 'Mark complete'}
              title={done ? 'Reopen' : 'Mark complete'}
            >
              {done ? <IconUndo /> : <IconCheck />}
            </button>
            <button className="icon-btn danger" onClick={onAskDelete} aria-label="Delete goal" title="Delete">
              <IconTrash />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(GoalCard)
