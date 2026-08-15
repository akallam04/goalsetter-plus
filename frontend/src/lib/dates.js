// All calendar math uses the same timezone as the backend's
// $dateToString grouping so day boundaries match exactly.
export const APP_TZ = 'America/Denver'

export const dayKey = (date = new Date()) =>
  date.toLocaleDateString('en-CA', { timeZone: APP_TZ })

export const todayKey = () => dayKey()

export const formatDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: APP_TZ,
  })
}

export const isOverdue = (goal) => {
  if (!goal?.dueDate || goal.status !== 'active') return false
  const due = new Date(goal.dueDate)
  if (Number.isNaN(due.getTime())) return false
  return dayKey(due) < todayKey()
}

export const daysUntilDue = (goal) => {
  if (!goal?.dueDate || goal.status !== 'active') return null
  const due = new Date(goal.dueDate)
  if (Number.isNaN(due.getTime())) return null
  return Math.round((new Date(dayKey(due)) - new Date(todayKey())) / 86400000)
}

// Compact countdown label: "today", "3d", "12d"
export const dueLabel = (goal) => {
  const d = daysUntilDue(goal)
  if (d === null) return null
  if (d < 0) return `${Math.abs(d)}d over`
  if (d === 0) return 'due today'
  return `${d}d left`
}

// Which attention bucket a goal belongs to. Drives the Today view.
export const bucketOf = (goal) => {
  if (goal.status === 'completed') return 'done'
  const d = daysUntilDue(goal)
  if (d === null) return 'undated'
  if (d < 0) return 'overdue'
  if (d === 0) return 'today'
  if (d <= 3) return 'soon'
  return 'later'
}

// Short human phrase for a due date, e.g. "3 days late", "Due today"
export const duePhrase = (goal) => {
  const d = daysUntilDue(goal)
  if (d === null) return null
  if (d < 0) return `${Math.abs(d)} ${Math.abs(d) === 1 ? 'day' : 'days'} late`
  if (d === 0) return 'Due today'
  if (d === 1) return 'Due tomorrow'
  if (d <= 6) return `Due in ${d} days`
  return `Due ${formatDate(goal.dueDate)}`
}

// Times are shown in the viewer's own clock: whoever set 1pm means their 1pm.
export const formatTime = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// A goal carries a time when the server says so, or when the stored
// hour is not the noon we write for date-only goals. The fallback keeps
// older rows and older server builds working.
export const goalHasTime = (goal) => {
  if (!goal?.dueDate) return false
  if (goal.hasTime === true) return true
  const d = new Date(goal.dueDate)
  if (Number.isNaN(d.getTime())) return false
  return !(d.getHours() === 12 && d.getMinutes() === 0)
}

// "Due today at 1:00 PM", "2 days late", "Due Sep 4"
export const dueSentence = (goal) => {
  const base = duePhrase(goal)
  if (!base) return null
  if (!goalHasTime(goal)) return base
  const t = formatTime(goal.dueDate)
  if (!t) return base
  return base.startsWith('Due') ? `${base} at ${t}` : `${base}, was due ${t}`
}

// "07:30" for an <input type="time">
export const toTimeInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const prettyClock = (hhmm) => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}
