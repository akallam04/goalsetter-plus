import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { buildDayMap, currentStreak } from '../lib/insights'
import { dayKey, todayKey } from '../lib/dates'
import { IconFlame } from './icons'

const WEEKS = 6

const level = (n) => (!n ? 'hm0' : n === 1 ? 'hm1' : n === 2 ? 'hm2' : n === 3 ? 'hm3' : 'hm4')

// The emotional core, promoted to the home surface: a chain you can see
// and a streak you do not want to break.
export default function MomentumStrip() {
  const { analytics, stats } = useSelector((s) => s.goals)

  const dayMap = useMemo(() => buildDayMap(analytics.completionsByDay), [analytics.completionsByDay])
  const streak = useMemo(() => currentStreak(dayMap), [dayMap])
  const cells = useMemo(() => {
    const today = todayKey()
    const todayDow = new Date(`${today}T00:00:00Z`).getUTCDay()
    const cursor = new Date()
    cursor.setDate(cursor.getDate() - (todayDow + (WEEKS - 1) * 7))
    const out = []
    for (let i = 0; i < WEEKS * 7; i++) {
      const key = dayKey(cursor)
      out.push({ key, count: dayMap[key] || 0, future: key > today })
      cursor.setDate(cursor.getDate() + 1)
    }
    return out
  }, [dayMap])

  const doneToday = dayMap[todayKey()] || 0
  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <section className="momentum" aria-label="Your momentum">
      <div className="mom-streak">
        <span className={`mom-flame${streak > 0 ? ' is-lit' : ''}`}><IconFlame size={20} /></span>
        <span className="mom-num">{streak}</span>
        <span className="mom-cap">day{streak === 1 ? '' : 's'}<br />streak</span>
      </div>

      <div className="mom-chain" aria-hidden="true">
        {cells.map((c) => (
          <span
            key={c.key}
            className={`hm-cell ${c.future ? 'hm-void' : level(c.count)}`}
            title={`${c.key}: ${c.count} completed`}
          />
        ))}
      </div>

      <dl className="mom-facts">
        <div>
          <dt>Done today</dt>
          <dd>{doneToday}</dd>
        </div>
        <div>
          <dt>Completion</dt>
          <dd>{rate}%</dd>
        </div>
      </dl>
    </section>
  )
}
