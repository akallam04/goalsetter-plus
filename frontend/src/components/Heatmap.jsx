import { useMemo } from 'react'
import { dayKey, todayKey } from '../lib/dates'

const DAY_LABELS = { 1: 'MON', 3: 'WED', 5: 'FRI' }
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const level = (count) => {
  if (!count) return 'hm0'
  if (count === 1) return 'hm1'
  if (count === 2) return 'hm2'
  if (count === 3) return 'hm3'
  return 'hm4'
}

// GitHub-style contribution grid: one column per week, Sunday on top,
// rightmost column is the current (possibly partial) week.
export default function Heatmap({ dayMap, weeks = 13 }) {
  const { columns, monthLabels } = useMemo(() => {
    const today = todayKey()
    const todayDow = new Date(`${today}T00:00:00Z`).getUTCDay()

    const cursor = new Date()
    cursor.setDate(cursor.getDate() - (todayDow + (weeks - 1) * 7))

    const cols = []
    const labels = []
    let prevMonth = -1

    for (let w = 0; w < weeks; w++) {
      const col = []
      for (let d = 0; d < 7; d++) {
        const key = dayKey(cursor)
        col.push(key > today ? null : { key, count: dayMap[key] || 0 })
        cursor.setDate(cursor.getDate() + 1)
      }
      const month = new Date(`${col[0].key}T00:00:00Z`).getUTCMonth()
      labels.push(month !== prevMonth ? MONTHS[month] : '')
      prevMonth = month
      cols.push(col)
    }
    return { columns: cols, monthLabels: labels }
  }, [dayMap, weeks])

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 2 }}>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {/* Day-of-week gutter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 16 }}>
          {Array.from({ length: 7 }, (_, d) => (
            <div key={d} className="mono hm-day">{DAY_LABELS[d] || ''}</div>
          ))}
        </div>

        {columns.map((col, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div
              className="mono"
              style={{ height: 13, fontSize: 8, color: 'var(--dim)', lineHeight: '13px' }}
            >
              {monthLabels[w]}
            </div>
            {col.map((cell, d) =>
              cell === null ? (
                <div key={d} className="hm-cell hm-void" />
              ) : (
                <div
                  key={d}
                  className={`hm-cell ${level(cell.count)}`}
                  title={`${cell.key} · ${cell.count} completed`}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>LESS</span>
        {['hm0', 'hm1', 'hm2', 'hm3', 'hm4'].map((l) => (
          <div key={l} className={`hm-cell ${l}`} style={{ width: 9, height: 9 }} />
        ))}
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>MORE</span>
      </div>
    </div>
  )
}
