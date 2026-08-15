import { useMemo } from 'react'
import GoalCard from './GoalCard'
import MomentumStrip from './MomentumStrip'
import QuickAdd from './QuickAdd'
import { EmptyState, ErrorState, GoalSkeleton } from './StateViews'
import { bucketOf, dayKey, todayKey } from '../lib/dates'

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

function Section({ id, title, count, tone, children }) {
  return (
    <section className="focus-sec" aria-labelledby={id}>
      <div className="sec-head">
        <h2 id={id} className={`sec-title${tone ? ` is-${tone}` : ''}`}>{title}</h2>
        <span className="sec-count">{count}</span>
      </div>
      {children}
    </section>
  )
}

// The home surface. It answers one question: what should I do right now?
export default function TodayView({
  goals, listStatus, error, onRetry,
  onCreate, createBusy, onToggle, onEdit, onDelete, onToggleSubtask,
}) {
  const groups = useMemo(() => {
    const g = { overdue: [], today: [], soon: [], rest: [], doneToday: [] }
    const tKey = todayKey()
    for (const goal of goals) {
      if (goal.status === 'completed') {
        if (goal.completedAt && dayKey(new Date(goal.completedAt)) === tKey) g.doneToday.push(goal)
        continue
      }
      const b = bucketOf(goal)
      if (b === 'overdue') g.overdue.push(goal)
      else if (b === 'today') g.today.push(goal)
      else if (b === 'soon') g.soon.push(goal)
      else g.rest.push(goal)
    }
    const byPriority = (a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
    g.overdue.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    g.today.sort(byPriority)
    g.soon.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    g.rest.sort(byPriority)
    return g
  }, [goals])

  const cardProps = (goal) => ({
    goal,
    onToggle: () => onToggle(goal),
    onEdit: () => onEdit(goal),
    onDelete: () => onDelete(goal),
    onToggleSubtask: (i) => onToggleSubtask(goal, i),
  })

  const list = (items) => (
    <ul className="gc-list">
      {items.map((g) => <GoalCard key={g._id} {...cardProps(g)} />)}
    </ul>
  )

  const focusCount = groups.overdue.length + groups.today.length
  const nothingUrgent = focusCount === 0 && groups.soon.length === 0

  const failedCold = listStatus === 'failed' && goals.length === 0

  if (failedCold) {
    return (
      <div className="today">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div className="today">
      <div className="today-main">
        <QuickAdd onCreate={onCreate} busy={createBusy} />

        {listStatus === 'failed' && <ErrorState message={error} onRetry={onRetry} />}

        {listStatus === 'loading' && goals.length === 0 && <GoalSkeleton rows={3} />}

        {listStatus !== 'failed' && (
        <div className="focus-stack" data-tour="focus">
          {groups.overdue.length > 0 && (
            <Section id="sec-overdue" title="Overdue" count={groups.overdue.length} tone="late">
              {list(groups.overdue)}
            </Section>
          )}

          {groups.today.length > 0 && (
            <Section id="sec-today" title="Due today" count={groups.today.length} tone="now">
              {list(groups.today)}
            </Section>
          )}

          {nothingUrgent && listStatus === 'succeeded' && (
            <EmptyState
              title={goals.length === 0 ? 'Your board is empty' : 'Nothing due today'}
              sub={
                goals.length === 0
                  ? 'Add your first goal above and start the chain.'
                  : 'You are clear. Pull something forward if you want to get ahead.'
              }
            />
          )}

          {groups.soon.length > 0 && (
            <Section id="sec-soon" title="Next few days" count={groups.soon.length}>
              {list(groups.soon)}
            </Section>
          )}

          {focusCount === 0 && groups.rest.length > 0 && (
            <Section id="sec-ahead" title="Get ahead" count={groups.rest.length}>
              {list(groups.rest.slice(0, 3))}
            </Section>
          )}

          {groups.doneToday.length > 0 && (
            <Section id="sec-done" title="Completed today" count={groups.doneToday.length} tone="good">
              {list(groups.doneToday)}
            </Section>
          )}
        </div>
        )}
      </div>

      <aside className="today-side" aria-label="Progress summary">
        <MomentumStrip />
      </aside>
    </div>
  )
}
