import { useState } from 'react'
import { useDispatch } from 'react-redux'
import client from '../api/client'
import { createGoal } from '../features/goals/goalsSlice'
import { IconCheck, IconPlus, IconSpark } from './icons'

const QUICK_PROMPTS = [
  'Get fit in 90 days',
  'Level up my career',
  'Build better money habits',
  'Ship a side project',
]

export default function AiCoachTab({ onToast }) {
  const dispatch = useDispatch()
  const [intent, setIntent] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState(null)
  const [added, setAdded] = useState([])

  const run = async (text) => {
    const query = (text ?? intent).trim()
    if (!query || loading) return
    setLoading(true)
    setError(null)
    setSuggestions([])
    setAdded([])
    try {
      const { data } = await client.post('/ai/suggest-goals', { intent: query })
      setSuggestions(data)
    } catch (err) {
      setError(err.response?.data?.message || 'The coach is unavailable right now. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const addSuggestion = async (s) => {
    const payload = {
      title: s.title,
      description: s.description,
      category: s.category,
      priority: s.priority,
    }
    if (s.suggestedDueDays) {
      const due = new Date()
      due.setDate(due.getDate() + s.suggestedDueDays)
      payload.dueDate = due.toISOString().slice(0, 10) + 'T12:00:00'
    }
    await dispatch(createGoal(payload))
    setAdded((prev) => [...prev, s.title])
    onToast(`Goal locked in: ${s.title.slice(0, 38)}`)
  }

  return (
    <div className="panel panel-tick">
      <div className="panel-head" style={{ marginBottom: 6 }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 3 }}>Powered by Claude</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconSpark size={17} style={{ color: 'var(--acc)' }} /> AI Coach
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--mut)', fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.6, maxWidth: 560 }}>
        Describe what you want to achieve. Claude turns it into three SMART goals:
        specific, measurable, and time-bound. One tap adds them to your board.
      </p>

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') run() }}
          placeholder='"get healthier" or "advance my software career"'
          style={{ flex: 1, minWidth: 220 }}
        />
        <button
          className="btn-primary"
          style={{ padding: '11px 22px', flexShrink: 0 }}
          onClick={() => run()}
          disabled={loading || !intent.trim()}
        >
          Generate
        </button>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            className="pill"
            disabled={loading}
            onClick={() => { setIntent(q); run(q) }}
          >
            {q}
          </button>
        ))}
      </div>

      {loading && (
        <div className="scanbox" style={{ marginTop: 16 }}>
          <span className="led pulse" />
          ANALYZING INTENT<span className="cursor-blink">_</span>
        </div>
      )}

      {error && (
        <div className="mono" style={{ marginTop: 14, color: 'var(--red)', fontSize: 12.5 }}>{error}</div>
      )}

      {suggestions.length > 0 && (
        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <div className="mono-label">PROPOSED GOALS</div>
          {suggestions.map((s, i) => {
            const isAdded = added.includes(s.title)
            return (
              <div
                key={s.title}
                className="gcard fade-in"
                style={{ animationDelay: `${i * 90}ms`, background: 'var(--panel)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gcard-title">{s.title}</div>
                  {s.description && <div className="gcard-desc">{s.description}</div>}
                  <div className="gcard-meta">
                    <span className={`chip chip-${s.priority}`}><span className="dot" />{s.priority}</span>
                    <span className="chip">{s.category}</span>
                    {s.suggestedDueDays && <span className="chip chip-acc">{s.suggestedDueDays}D RUNWAY</span>}
                  </div>
                </div>
                <div className="gcard-actions">
                  {isAdded ? (
                    <span className="chip chip-acc" style={{ alignSelf: 'center' }}>
                      <IconCheck size={11} /> ADDED
                    </span>
                  ) : (
                    <button className="btn-ghost-acc" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => addSuggestion(s)}>
                      <IconPlus size={13} /> Add
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
