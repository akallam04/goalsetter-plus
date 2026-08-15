import { useState } from 'react'
import parseGoalText from '../lib/parseGoalText'
import { IconPlus } from './icons'

const DUE_PRESETS = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: 'week', label: 'In a week', days: 7 },
]

const atNoon = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(12, 0, 0, 0)
  return d
}

const stamp = (d, withTime) =>
  d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
  (withTime ? ` at ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : '')

// One line, one Enter. Say when in plain words and it is understood.
export default function QuickAdd({ onCreate, busy }) {
  const [text, setText] = useState('')
  const [preset, setPreset] = useState(null)
  const [priority, setPriority] = useState('medium')

  const parsed = parseGoalText(text)
  const usingPreset = preset !== null
  const shownDate = usingPreset ? atNoon(preset) : parsed.date
  const shownHasTime = usingPreset ? false : parsed.hasTime

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const payload = {
      title: usingPreset ? text.trim() : parsed.title,
      priority,
      category: 'General',
    }
    if (shownDate) {
      payload.dueDate = shownDate.toISOString()
      payload.hasTime = shownHasTime
    }
    onCreate(payload)
    setText('')
    setPreset(null)
    setPriority('medium')
  }

  return (
    <form className="qa" onSubmit={submit} data-tour="quick-add">
      <div className="qa-row">
        <input
          className="qa-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a goal. Try: submit essay friday 9am"
          aria-label="New goal"
          maxLength={140}
        />
        <button type="submit" className="btn-primary qa-btn" disabled={busy || !text.trim()}>
          <IconPlus size={16} /> <span className="qa-btn-txt">Add</span>
        </button>
      </div>

      <div className="qa-opts">
        <div className="qa-group" role="group" aria-label="Due date">
          {DUE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`qa-chip${preset === p.days ? ' is-on' : ''}`}
              aria-pressed={preset === p.days}
              onClick={() => setPreset(preset === p.days ? null : p.days)}
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

        {shownDate && (
          <span className="qa-hint">
            {shownHasTime ? 'Date and time set: ' : 'Date set: '}{stamp(shownDate, shownHasTime)}
            {!usingPreset && parsed.title !== text.trim() && <>, title becomes &ldquo;{parsed.title}&rdquo;</>}
          </span>
        )}
      </div>
    </form>
  )
}
