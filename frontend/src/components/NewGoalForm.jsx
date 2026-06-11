import { useState } from 'react'
import * as chrono from 'chrono-node'

const CATEGORY_SUGGESTIONS = ['Career', 'Health', 'Learning', 'Finance', 'Personal', 'Fitness', 'Creative', 'Social']

// Self-contained goal creation form. Mounted twice: as the desktop
// side panel and inside the mobile bottom sheet, each with its own draft.
export default function NewGoalForm({ onCreate, creating, error, titleRef }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [nlDate, setNlDate] = useState('')
  const [nlParsed, setNlParsed] = useState(null)

  const handleNlDate = (text) => {
    setNlDate(text)
    if (!text.trim()) {
      setNlParsed(null)
      return
    }
    const result = chrono.parseDate(text, new Date(), { forwardDate: true })
    setNlParsed(result)
    if (result) setDueDate(result.toLocaleDateString('en-CA'))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const payload = { title, category: category.trim() || 'General', priority }
    if (dueDate) payload.dueDate = `${dueDate}T12:00:00`
    const ok = await onCreate(payload)
    if (ok) {
      setTitle('')
      setDueDate('')
      setNlDate('')
      setNlParsed(null)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 13 }}>
      <div>
        <label className="label">Objective</label>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ship my portfolio site this month"
          maxLength={120}
        />
      </div>

      <div className="form-grid-2">
        <div>
          <label className="label">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Career"
            list="category-suggestions"
            maxLength={50}
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="label">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Target date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => { setDueDate(e.target.value); setNlDate(''); setNlParsed(null) }}
        />
        <input
          value={nlDate}
          onChange={(e) => handleNlDate(e.target.value)}
          placeholder='or type "next friday", "in 2 weeks"'
          style={{ marginTop: 7 }}
        />
        {nlDate && (
          <div
            className="mono"
            style={{ fontSize: 11, marginTop: 6, letterSpacing: '0.04em', color: nlParsed ? 'var(--acc)' : 'var(--red)' }}
          >
            {nlParsed
              ? `LOCKED: ${nlParsed.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`
              : 'UNABLE TO PARSE DATE'}
          </div>
        )}
      </div>

      {error && (
        <div className="mono" style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>
      )}

      <button
        type="submit"
        className="btn-primary"
        style={{ padding: '12px 24px', fontSize: 14.5 }}
        disabled={creating || !title.trim()}
      >
        {creating ? 'Deploying...' : 'Set Goal'}
      </button>
    </form>
  )
}
