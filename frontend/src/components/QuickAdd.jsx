import { useState } from 'react'
import * as chrono from 'chrono-node'
import { IconPlus } from './icons'

const DUE_PRESETS = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: 'week', label: 'In a week', days: 7 },
]

const isoAt = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.toLocaleDateString('en-CA')}T12:00:00`
}

// One line, one Enter. Adding a goal is the action that must never feel
// like filling in a form.
export default function QuickAdd({ onCreate, busy }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(null)
  const [priority, setPriority] = useState('medium')

  const parsed = chrono.parse(title, new Date(), { forwardDate: true })[0]

  const submit = (e) => {
    e.preventDefault()
    const text = title.trim()
    if (!text) return

    // "gym tomorrow" sets the date and keeps the title clean
    let cleanTitle = text
    let dueDate = due !== null ? isoAt(due) : null
    if (parsed && due === null) {
      dueDate = `${parsed.start.date().toLocaleDateString('en-CA')}T12:00:00`
      cleanTitle = text.replace(parsed.text, '').replace(/\s{2,}/g, ' ').trim() || text
    }

    onCreate({ title: cleanTitle, priority, category: 'General', ...(dueDate ? { dueDate } : {}) })
    setTitle('')
    setDue(null)
    setPriority('medium')
  }

  return (
    <form className="qa" onSubmit={submit} data-tour="quick-add">
      <div className="qa-row">
        <input
          className="qa-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to get done?"
          aria-label="New goal"
          maxLength={120}
        />
        <button type="submit" className="btn-primary qa-btn" disabled={busy || !title.trim()}>
          <IconPlus size={16} /> <span className="qa-btn-txt">Add</span>
        </button>
      </div>

      <div className="qa-opts">
        <div className="qa-group" role="group" aria-label="Due date">
          {DUE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`qa-chip${due === p.days ? ' is-on' : ''}`}
              aria-pressed={due === p.days}
              onClick={() => setDue(due === p.days ? null : p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="qa-group" role="group" aria-label="Priority">
          {['low', 'medium', 'high'].map((p) => (
            <button
              key={p}
              type="button"
              className={`qa-chip qa-prio-${p}${priority === p ? ' is-on' : ''}`}
              aria-pressed={priority === p}
              onClick={() => setPriority(p)}
            >
              {p}
            </button>
          ))}
        </div>
        {parsed && due === null && (
          <span className="qa-hint">Date detected: {parsed.start.date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
    </form>
  )
}
