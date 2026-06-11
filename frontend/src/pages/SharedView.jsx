import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import ProgressRing from '../components/ProgressRing'
import { IconTarget } from '../components/icons'
import { formatDate } from '../lib/dates'

export default function SharedView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Goalsetter+ | Shared board'
    axios
      .get(`${import.meta.env.VITE_API_URL}/share/${token}`)
      .then((res) => setData(res.data))
      .catch(() => setError('This share link is invalid or has been revoked.'))
      .finally(() => setLoading(false))
  }, [token])

  const active = data?.goals.filter((g) => g.status === 'active') ?? []
  const completed = data?.goals.filter((g) => g.status === 'completed') ?? []
  const rate = data?.goals.length > 0 ? Math.round((completed.length / data.goals.length) * 100) : 0

  return (
    <div className="page">
      <div className="shell" style={{ maxWidth: 760 }}>

        <div className="topbar">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="brand">
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
                <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
                <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <span>Goalsetter<span className="plus">+</span></span>
            </div>
          </Link>
          <span className="chip">READ ONLY</span>
        </div>

        {loading && (
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="skel" style={{ height: 80 }} />
            <div className="skel" style={{ height: 200 }} />
          </div>
        )}

        {error && (
          <div className="panel">
            <div className="empty">
              <IconTarget size={34} />
              <div className="empty-title">Link offline</div>
              <div className="empty-sub">{error}</div>
            </div>
          </div>
        )}

        {data && (
          <>
            <div className="top-sub" style={{ marginTop: -4 }}>
              <span>BOARD OWNER: {data.ownerName?.toUpperCase()}</span>
              <span className="sep">/</span>
              <span>{data.goals.length} GOALS</span>
            </div>

            <div className="telemetry telemetry-4">
              <div className="t-cell">
                <span className="t-num">{data.goals.length}</span>
                <span className="t-lbl">Total</span>
              </div>
              <div className="t-cell">
                <span className="t-num" style={{ color: 'var(--acc)' }}>{active.length}</span>
                <span className="t-lbl"><span className="led" />Active</span>
              </div>
              <div className="t-cell">
                <span className="t-num">{completed.length}</span>
                <span className="t-lbl">Done</span>
              </div>
              <div className="t-cell" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ProgressRing value={rate} size={42} stroke={4} />
                <span className="t-lbl">Rate</span>
              </div>
            </div>

            {active.length > 0 && (
              <div className="panel">
                <div className="panel-head">
                  <div className="section-title">Active Goals</div>
                  <span className="mono-label">{active.length} OPEN</span>
                </div>
                <div style={{ display: 'grid', gap: 9 }}>
                  {active.map((g) => {
                    const subs = g.subtasks || []
                    const subsDone = subs.filter((s) => s.completed).length
                    return (
                      <div key={g._id} className={`gcard p-${g.priority}`}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="gcard-title">{g.title}</div>
                          {g.description && <div className="gcard-desc">{g.description}</div>}
                          <div className="gcard-meta">
                            <span className={`chip chip-${g.priority}`}><span className="dot" />{g.priority}</span>
                            <span className="chip">{g.category}</span>
                            {g.dueDate && <span className="chip">{formatDate(g.dueDate)}</span>}
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
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div className="panel">
                <div className="panel-head">
                  <div className="section-title">Completed</div>
                  <span className="mono-label">{completed.length} DONE</span>
                </div>
                <div style={{ display: 'grid', gap: 9 }}>
                  {completed.map((g) => (
                    <div key={g._id} className="gcard p-low done">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="gcard-title">{g.title}</div>
                        <div className="gcard-meta">
                          <span className="chip chip-done">done</span>
                          <span className="chip">{g.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.goals.length === 0 && (
              <div className="panel">
                <div className="empty">
                  <IconTarget size={34} />
                  <div className="empty-title">Nothing shared yet</div>
                  <div className="empty-sub">This board is empty for now.</div>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 13, marginTop: 6 }}>
          Want a board like this?{' '}
          <Link to="/register" style={{ color: 'var(--acc)' }}>Start tracking free</Link>
        </div>
      </div>
    </div>
  )
}
