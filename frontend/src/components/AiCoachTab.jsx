import { useState } from 'react'
import { useDispatch } from 'react-redux'
import client from '../api/client'
import friendlyError from '../lib/apiError'
import { createGoal } from '../features/goals/goalsSlice'
import ClaudePixel from './ClaudePixel'
import ClaudeSpin from './ClaudeSpin'
import { prettyClock } from '../lib/dates'
import { IconCheck, IconPlus } from './icons'

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
  const [loadingMore, setLoadingMore] = useState(false)

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
      setError(friendlyError(err, 'The coach is unavailable right now. Try again.'))
    } finally {
      setLoading(false)
    }
  }

  // Ask for more without losing what is already on screen, and tell the
  // model what it already gave you so it does not repeat itself.
  const more = async () => {
    if (!intent.trim() || loadingMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const { data } = await client.post('/ai/suggest-goals', {
        intent: intent.trim(),
        count: 3,
        exclude: suggestions.map((s) => s.title),
      })
      const fresh = data.filter((d) => !suggestions.some((s) => s.title === d.title))
      setSuggestions((prev) => [...prev, ...fresh])
    } catch (err) {
      setError(friendlyError(err, 'Could not fetch more ideas. Try again.'))
    } finally {
      setLoadingMore(false)
    }
  }

  const addSuggestion = async (s) => {
    const payload = {
      title: s.title,
      description: s.description,
      category: s.category,
      priority: s.priority,
      subtasks: Array.isArray(s.steps)
        ? s.steps.slice(0, 4).map((st) => ({ text: String(st.text).slice(0, 200), completed: false, time: st.time || '' }))
        : [],
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
      <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="panel-head" style={{ marginBottom: 6 }}>
            <div>
              <div className="mono-label" style={{ marginBottom: 3, color: 'var(--claude)' }}>Powered by Claude</div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <ClaudeSpin size={19} /> AI Coach
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
        </div>

        <div className="desktop-only" style={{ paddingRight: 18, paddingTop: 6 }}>
          <ClaudePixel size={120} />
        </div>
      </div>

      {suggestions.length === 0 && !loading && !error && (
        <ol className="how">
          <li>
            <span className="how-n">1</span>
            <strong>Describe the outcome</strong>
            <span>Plain English is enough. "Get fit in 90 days" works.</span>
          </li>
          <li>
            <span className="how-n">2</span>
            <strong>Claude drafts the goals</strong>
            <span>Each one is specific and measurable, broken into steps with sensible timings.</span>
          </li>
          <li>
            <span className="how-n">3</span>
            <strong>Keep what fits</strong>
            <span>Add the ones you like in one tap, then edit the timings to suit your day.</span>
          </li>
        </ol>
      )}

      {loading && (
        <div className="scanbox scanbox-claude" style={{ marginTop: 16 }}>
          <ClaudeSpin size={30} />
          CLAUDE IS THINKING<span className="cursor-blink">_</span>
        </div>
      )}

      {error && (
        <div className="mono" style={{ marginTop: 14, color: 'var(--red)', fontSize: 12.5 }}>{error}</div>
      )}

      {suggestions.length > 0 && (
        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono-label">PROPOSED GOALS</span>
            <span className="chip chip-claude">GENERATED BY CLAUDE</span>
          </div>
          {suggestions.map((s, i) => {
            const isAdded = added.includes(s.title)
            return (
              <div
                key={s.title}
                className="gc is-static fade-in"
                style={{ animationDelay: `${i * 90}ms`, background: 'var(--panel)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gc-title">{s.title}</div>
                  {s.description && <div className="gc-desc">{s.description}</div>}
                  <div className="gc-meta">
                    <span className={`chip chip-${s.priority}`}><span className="dot" />{s.priority}</span>
                    <span className="chip">{s.category}</span>
                    {s.suggestedDueDays && <span className="chip chip-acc">{s.suggestedDueDays} day runway</span>}
                  </div>
                  {Array.isArray(s.steps) && s.steps.length > 0 && (
                    <ul className="sug-steps">
                      {s.steps.slice(0, 4).map((st, k) => (
                        <li key={k} className="sug-step">
                          {st.text}
                          {st.time && <time>{prettyClock(st.time)}</time>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="gc-actions">
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

          <button
            className="show-more"
            onClick={more}
            disabled={loadingMore}
          >
            {loadingMore ? 'Asking Claude for more...' : 'Show me more ideas'}
          </button>
        </div>
      )}
    </div>
  )
}
