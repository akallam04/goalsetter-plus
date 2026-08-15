import { IconTarget } from './icons'
import { IconOffline, IconRetry } from './icons2'

// Every failure the user can actually hit gets a designed state with a way out.
export function ErrorState({ message, onRetry }) {
  return (
    <div className="state" role="alert">
      <span className="state-ic is-err"><IconOffline size={22} /></span>
      <h3 className="state-title">Could not load your goals</h3>
      <p className="state-sub">{message || 'Something went wrong reaching the server.'}</p>
      {onRetry && (
        <button className="btn-primary state-btn" onClick={onRetry}>
          <IconRetry size={15} /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, sub, action }) {
  return (
    <div className="state">
      <span className="state-ic"><IconTarget size={22} /></span>
      <h3 className="state-title">{title}</h3>
      {sub && <p className="state-sub">{sub}</p>}
      {action}
    </div>
  )
}

// Shown while a request is slow (free-tier servers sleep) or the device is offline.
export function ConnectionBanner({ offline, waking, onRetry }) {
  if (!offline && !waking) return null
  return (
    <div className={`banner${offline ? ' is-offline' : ''}`} role="status">
      <span className="banner-dot" />
      <span>
        {offline
          ? 'You are offline. Changes will fail until the connection is back.'
          : 'Waking the server. This can take up to 30 seconds on the free tier.'}
      </span>
      {offline && onRetry && (
        <button className="banner-btn" onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}

export function GoalSkeleton({ rows = 3 }) {
  return (
    <ul className="gc-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="skel" style={{ height: 76 }} />
      ))}
    </ul>
  )
}
