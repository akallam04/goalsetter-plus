import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchAnalytics } from '../features/goals/goalsSlice'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6']

// Fill every day in range with 0 if no completions that day
const fillDays = (data, days) => {
  const map = Object.fromEntries(data.map((d) => [d._id, d.count]))
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-CA') // YYYY-MM-DD
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    result.push({ date: label, count: map[key] || 0 })
  }
  return result
}

const tooltipStyle = {
  background: '#111827',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 10,
  color: '#f1f5f9',
  fontSize: 13,
}

export default function AnalyticsSection() {
  const dispatch = useDispatch()
  const { analytics, analyticsStatus } = useSelector((s) => s.goals)
  const [days, setDays] = useState(30)
  const [open, setOpen] = useState(false)

  const toggle = () => {
    if (!open && analyticsStatus === 'idle') dispatch(fetchAnalytics(days))
    setOpen((v) => !v)
  }

  const switchDays = (d) => {
    setDays(d)
    dispatch(fetchAnalytics(d))
  }

  const lineData = fillDays(analytics.completionsByDay, days)
  const pieData  = analytics.byCategory.map((c) => ({ name: c._id, value: c.total }))

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header — always visible, click to expand */}
      <button
        onClick={toggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '16px 20px',
          background: 'transparent', border: 'none', borderRadius: 0,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="section-title">Analytics</span>
          <span className="badge badge-default">Charts</span>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 20px' }}>
          {analyticsStatus === 'loading' && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>Loading charts…</div>
          )}

          {analyticsStatus === 'succeeded' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="analytics-grid">

              {/* Line chart — completions over time */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>
                    Goals completed
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[7, 30].map((d) => (
                      <button
                        key={d}
                        className={`filter-btn${days === d ? ' active' : ''}`}
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => switchDays(d)}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={lineData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={days === 7 ? 0 : 'preserveStartEnd'}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Completed"
                      stroke="#7c3aed"
                      strokeWidth={2.5}
                      dot={{ fill: '#7c3aed', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: '#a78bfa' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart — category breakdown */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 14 }}>
                  Goals by category
                </div>
                {pieData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted2)', fontSize: 13 }}>
                    No goals yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
