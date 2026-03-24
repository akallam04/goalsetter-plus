import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const PRIORITY_COLOR = { high: '#fca5a5', medium: '#fcd34d', low: '#6ee7b7' }

const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Denver' })
}

export default function SharedView() {
  const { token } = useParams()
  const [data, setData]     = useState(null)
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/share/${token}`)
      .then((res) => setData(res.data))
      .catch(() => setError('This share link is invalid or has been revoked.'))
      .finally(() => setLoading(false))
  }, [token])

  const active    = data?.goals.filter((g) => g.status === 'active')    ?? []
  const completed = data?.goals.filter((g) => g.status === 'completed') ?? []

  return (
    <div style={{ minHeight: '100vh', padding: '32px 20px' }}>
      <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', display: 'grid', gap: 20 }}>

        {/* Header */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>
            Goalsetter<span style={{ color: 'var(--accent-light)' }}>+</span>
          </div>
          {loading && <div style={{ marginTop: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>}
          {error   && <div style={{ marginTop: 40, textAlign: 'center', color: '#fca5a5' }}>{error}</div>}
          {data && (
            <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 15 }}>
              <span style={{ color: 'var(--text)', fontWeight: 700 }}>{data.ownerName}</span>'s goals
              <span style={{ color: 'var(--muted2)', fontSize: 13, marginLeft: 10 }}>— read only</span>
            </div>
          )}
        </div>

        {data && (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Total',     value: data.goals.length,  color: 'var(--accent-light)' },
                { label: 'Active',    value: active.length,      color: 'var(--cyan-light)'   },
                { label: 'Completed', value: completed.length,   color: '#6ee7b7'             },
              ].map(({ label, value, color }) => (
                <div key={label} className="stat-card">
                  <div className="stat-number" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Active goals */}
            {active.length > 0 && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 12 }}>Active Goals ({active.length})</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {active.map((g) => (
                    <div key={g._id} className={`goal-card priority-${g.priority}`}>
                      <div style={{ flex: 1 }}>
                        <div className="goal-title">{g.title}</div>
                        {g.description && (
                          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{g.description}</div>
                        )}
                        <div className="goal-meta">
                          <span className={`badge badge-${g.priority}`}>{g.priority}</span>
                          <span className="badge badge-default">{g.category}</span>
                          {g.dueDate && (
                            <span className="badge badge-default">{formatDate(g.dueDate)}</span>
                          )}
                          {g.subtasks?.length > 0 && (
                            <span className="badge badge-default">
                              {g.subtasks.filter((s) => s.completed).length}/{g.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed goals */}
            {completed.length > 0 && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 12 }}>Completed ({completed.length})</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {completed.map((g) => (
                    <div key={g._id} className="goal-card priority-low completed">
                      <div style={{ flex: 1 }}>
                        <div className="goal-title">{g.title}</div>
                        <div className="goal-meta">
                          <span className="badge badge-completed">✓ done</span>
                          <span className="badge badge-default">{g.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.goals.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div>No goals shared yet.</div>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', color: 'var(--muted2)', fontSize: 13, marginTop: 8 }}>
          Want to track your own goals?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'underline' }}>
            Get started free
          </Link>
        </div>
      </div>
    </div>
  )
}
