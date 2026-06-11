import { dayKey } from './dates'

// completionsByDay arrives as [{ _id: 'YYYY-MM-DD', count }]
export const buildDayMap = (completionsByDay) =>
  Object.fromEntries(completionsByDay.map((d) => [d._id, d.count]))

const shiftKey = (offsetDays) => {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return dayKey(d)
}

// Consecutive days with at least one completion, ending today.
// A streak survives if today is still empty but yesterday counted.
export const currentStreak = (map) => {
  let streak = 0
  let offset = map[shiftKey(0)] ? 0 : 1
  while (map[shiftKey(offset)]) {
    streak += 1
    offset += 1
  }
  return streak
}

export const bestStreak = (map, windowDays = 90) => {
  let best = 0
  let run = 0
  for (let i = windowDays - 1; i >= 0; i--) {
    if (map[shiftKey(i)]) {
      run += 1
      if (run > best) best = run
    } else {
      run = 0
    }
  }
  return best
}

const sumRange = (map, fromOffset, toOffset) => {
  let sum = 0
  for (let i = fromOffset; i <= toOffset; i++) sum += map[shiftKey(i)] || 0
  return sum
}

// Last 7 days vs the 7 before: { now, prev, delta }
// delta is a percentage, or null when there is no baseline.
export const momentum = (map) => {
  const now = sumRange(map, 0, 6)
  const prev = sumRange(map, 7, 13)
  const delta = prev === 0 ? null : Math.round(((now - prev) / prev) * 100)
  return { now, prev, delta }
}

// Weekday with the most completions in the window, e.g. "Tuesday"
export const bestWeekday = (completionsByDay) => {
  if (completionsByDay.length === 0) return null
  const totals = new Array(7).fill(0)
  for (const { _id, count } of completionsByDay) {
    totals[new Date(`${_id}T00:00:00Z`).getUTCDay()] += count
  }
  const max = Math.max(...totals)
  if (max === 0) return null
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return names[totals.indexOf(max)]
}

// Slice the last N days into chart points: [{ key, label, count }]
export const chartPoints = (map, days) => {
  const points = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    points.push({
      key,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'America/Denver' }),
      count: map[key] || 0,
    })
  }
  return points
}
