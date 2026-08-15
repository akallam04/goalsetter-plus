import * as chrono from 'chrono-node'

// Words that are only there to introduce a date and read as debris once
// the date has been lifted out: "assignment on sept 4th by 1pm"
const TRAILING = /\s+(on|by|at|before|after|due|until|till|from|this|next|the|every)$/i
const LEADING = /^(on|by|at|before|after|due|until|till|from)\s+/i

/**
 * Pull a date and a time out of free text and hand back a clean title.
 * Handles the date and the time arriving as separate matches, which is
 * what chrono does with "sept 4th by 1pm".
 */
export default function parseGoalText(raw) {
  const text = (raw || '').trim()
  if (!text) return { title: '', date: null, hasTime: false, matched: null }

  const results = chrono.parse(text, new Date(), { forwardDate: true })
  if (results.length === 0) return { title: text, date: null, hasTime: false, matched: null }

  const knows = (r, unit) => {
    try { return r.start.isCertain(unit) } catch { return false }
  }

  // One match may carry the day, another the hour. Take the best of each.
  const dayRes = results.find((r) => knows(r, 'day') || knows(r, 'weekday') || knows(r, 'month')) || results[0]
  const timeRes = results.find((r) => knows(r, 'hour'))

  const date = dayRes.start.date()
  if (timeRes) {
    const t = timeRes.start.date()
    date.setHours(t.getHours(), t.getMinutes(), 0, 0)
  } else {
    date.setHours(12, 0, 0, 0)
  }

  // Remove every matched range, right to left so earlier indices stay valid
  let title = text
  const ranges = results
    .map((r) => [r.index, r.index + r.text.length])
    .sort((a, b) => b[0] - a[0])
  for (const [from, to] of ranges) title = `${title.slice(0, from)} ${title.slice(to)}`

  // Then sweep up the connectors the date left behind
  let previous
  do {
    previous = title
    title = title
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/[\s,;:.-]+$/, '')
      .replace(/^[\s,;:.-]+/, '')
      .replace(TRAILING, '')
      .replace(LEADING, '')
  } while (title !== previous)

  return {
    title: title || text,
    date,
    hasTime: !!timeRes,
    matched: results.map((r) => r.text).join(' '),
  }
}
