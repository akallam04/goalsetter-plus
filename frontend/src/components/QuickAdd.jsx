import { useState } from 'react'
import parseGoalText from '../lib/parseGoalText'
import { IconPlus } from './icons'

const PRESETS = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: 'week', label: 'In a week', days: 7 },
]

const isoDay = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA')
}

/**
 * Two ways to say when, and neither gets in the other's way:
 * type it in the sentence, or set the date and time yourself. Picking
 * anything manually leaves the title exactly as written.
 */
export default function QuickAdd({ onCreate, busy }) {
  const [text, setText] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState('medium')

  const parsed = parseGoalText(text)
  const manual = !!date

  const finalDate = manual
    ? new Date(`${date}T${time || '12:00'}:00`)
    : parsed.date
  const finalHasTime = manual ? !!time : parsed.hasTime
  const finalTitle = manual ? text.trim() : parsed.title

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const payload = { title: finalTitle, priority, category: 'General' }
    if (finalDate) {
      payload.dueDate = finalDate.toISOString()
      payload.hasTime = finalHasTime
    }
    onCreate(payload)
    setText('')
    setDate('')
    setTime('')
    setPriority('medium')
  }

  const stamp = finalDate
    ? finalDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      (finalHasTime ? ` at ${finalDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : '')
    : null

  return (
    <form className="qa" onSubmit={submit} data-tour="quick-add">
      <div className="qa-row">
        <input
          className="qa-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a goal. Type it plainly, or say when: submit essay friday 9am"
          aria-label="New goal"
          maxLength={140}
        />
        <button type="submit" className="btn-primary qa-btn" disabled={busy || !text.trim()}>
          <IconPlus size={16} /> <span className="qa-btn-txt">Add</span>
        </button>
      </div>

      <div className="qa-opts">
        <div className="qa-group" role="group" aria-label="Quick due date">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`qa-chip${date === isoDay(p.days) ? ' is-on' : ''}`}
              aria-pressed={date === isoDay(p.days)}
              onClick={() => setDate(date === isoDay(p.days) ? '' : isoDay(p.days))}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="qa-when">
          <input
            type="date"
            className="qa-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Due date"
          />
          <input
            type="time"
            className="qa-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={!date}
            aria-label="Due time"
            title={date ? 'Time of day' : 'Pick a date first'}
          />
          {(date || time) && (
            <button
              type="button"
              className="qa-clear"
              onClick={() => { setDate(''); setTime('') }}
              aria-label="Clear date and time"
            >
              Clear
            </button>
          )}
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

        {stamp && (
          <span className="qa-hint">
            Due {stamp}
            {!manual && finalTitle !== text.trim() && <>, saved as &ldquo;{finalTitle}&rdquo;</>}
          </span>
        )}
      </div>
    </form>
  )
}
