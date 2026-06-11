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
