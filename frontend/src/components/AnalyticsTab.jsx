import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import AreaChart from './AreaChart'
import Heatmap from './Heatmap'
import ProgressRing from './ProgressRing'
import { IconFlame, IconTrendDown, IconTrendUp } from './icons'
import { bestStreak, bestWeekday, buildDayMap, chartPoints, currentStreak, momentum } from '../lib/insights'

const RANGES = [7, 30, 90]

function Readout({ label, children, accent }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 2px', borderBottom: '1px solid var(--line)', gap: 10,
      }}
    >
      <span className="mono-label">{label}</span>
      <span
        className="mono"
        style={{ fontSize: 13.5, fontWeight: 700, color: accent || 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {children}
      </span>
    </div>
  )
}

export default function AnalyticsTab() {
  const { analytics, analyticsStatus, stats } = useSelector((s) => s.goals)
  const [range, setRange] = useState(30)

  const dayMap = useMemo(() => buildDayMap(analytics.completionsByDay), [analytics.completionsByDay])
  const points = useMemo(() => chartPoints(dayMap, range), [dayMap, range])

  const streak = useMemo(() => currentStreak(dayMap), [dayMap])
  const best = useMemo(() => bestStreak(dayMap), [dayMap])
  const mom = useMemo(() => momentum(dayMap), [dayMap])
  const topDay = useMemo(() => bestWeekday(analytics.completionsByDay), [analytics.completionsByDay])
  const total90 = useMemo(
    () => analytics.completionsByDay.reduce((sum, d) => sum + d.count, 0),
    [analytics.completionsByDay]
  )

  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const loading = analyticsStatus === 'loading' && analytics.completionsByDay.length === 0

  if (loading) {
    return (
      <div className="an-grid">
        <div className="skel" style={{ height: 240 }} />
        <div className="skel" style={{ height: 240 }} />
      </div>
    )
  }

  const momDisplay = () => {
    if (mom.now === 0 && mom.prev === 0) return <span style={{ color: 'var(--dim)' }}>FLAT</span>
    if (mom.delta === null) return <span style={{ color: 'var(--acc)' }}><IconTrendUp /> NEW</span>
    const up = mom.delta >= 0
    return (
      <span style={{ color: up ? 'var(--acc)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {up ? <IconTrendUp /> : <IconTrendDown />}
        {up ? '+' : ''}{mom.delta}%
      </span>
    )
  }

  const activeDays = analytics.completionsByDay.length
  const peakDay = analytics.completionsByDay.reduce((max, d) => Math.max(max, d.count), 0)

  return (
    <div className="an-stack">
      <div className="an-grid">
        <div className="panel an-flex">
          <div className="panel-head">
            <div>
              <div className="mono-label" style={{ marginBottom: 3 }}>Last 13 weeks</div>
              <div className="section-title">Completion Activity</div>
            </div>
            <span className="chip chip-acc">{total90} IN 90D</span>
          </div>
          <div className="an-center">
            <Heatmap dayMap={dayMap} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <span className="chip">ACTIVE DAYS {activeDays}/90</span>
            <span className="chip">PEAK {peakDay}/DAY</span>
            <span className="chip">AVG {(total90 / 90).toFixed(1)}/DAY</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 8 }}>
            <div>
              <div className="mono-label" style={{ marginBottom: 3 }}>Telemetry</div>
              <div className="section-title">Performance</div>
            </div>
            <ProgressRing value={rate} size={46} />
          </div>
          <Readout label="Current streak" accent={streak > 0 ? 'var(--acc)' : 'var(--dim)'}>
            {streak > 0 && <IconFlame size={14} />}
            {streak} {streak === 1 ? 'DAY' : 'DAYS'}
          </Readout>
          <Readout label="Best streak (90d)">{best} {best === 1 ? 'DAY' : 'DAYS'}</Readout>
          <Readout label="Momentum (7d)">{momDisplay()}</Readout>
          <Readout label="Power day">{topDay ? topDay.toUpperCase() : 'NO DATA'}</Readout>
          <Readout label="Completion rate">{rate}%</Readout>
        </div>
      </div>

      <div className="an-grid-2">
        <div className="panel an-flex">
          <div className="panel-head">
            <div className="section-title">Completions</div>
            <div className="filter-row">
              {RANGES.map((d) => (
                <button
                  key={d}
                  className={`pill${range === d ? ' active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 10.5 }}
                  onClick={() => setRange(d)}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="an-center">
            <AreaChart data={points} height={175} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="section-title">Categories</div>
            <span className="mono-label">DONE / TOTAL</span>
          </div>
          {analytics.byCategory.length === 0 ? (
            <div className="empty" style={{ padding: '30px 16px' }}>
              <div className="empty-sub">Add goals to see the category split.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 9 }}>
              {analytics.byCategory.map((c) => (
                <div className="catbar" key={c._id}>
                  <div className="row">
                    <span className="name">{c._id}</span>
                    <span className="nums">{c.completed}/{c.total}</span>
                  </div>
                  <div className="track">
                    <div className="done-fill" style={{ width: `${(c.completed / c.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
