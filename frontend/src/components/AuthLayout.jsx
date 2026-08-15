import { IconChart, IconCheck, IconLink, IconSpark } from './icons'

const FEATURES = [
  { Icon: IconSpark, title: 'An AI coach that plans for you', sub: 'Claude turns an intent into goals with steps and timings' },
  { Icon: IconChart, title: 'Streaks you can actually see', sub: 'A 13-week chain, built by hand in SVG' },
  { Icon: IconLink, title: 'Share progress with one link', sub: 'Read only, revocable, no account needed to view' },
]

// A honest preview beats an abstract graphic: this is a still of the
// real Today screen, so people know what they are signing in to.
function ProductPreview() {
  const chain = [0, 2, 1, 0, 3, 1, 0, 2, 4, 0, 1, 2, 3, 0, 2, 1, 4, 2, 0, 1, 3, 2, 1, 0, 2, 3, 1, 4]
  const level = (n) => (!n ? 'hm0' : n === 1 ? 'hm1' : n === 2 ? 'hm2' : n === 3 ? 'hm3' : 'hm4')

  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-top">
        <span className="preview-streak">
          <strong>12</strong>
          <span>day streak</span>
        </span>
        <span className="preview-chain">
          {chain.map((n, i) => <span key={i} className={`hm-cell ${level(n)}`} />)}
        </span>
      </div>

      <p className="preview-label">Due today</p>

      <div className="preview-row">
        <span className="preview-check is-done"><IconCheck size={12} /></span>
        <span className="preview-text is-done">Morning run, 5km</span>
        <span className="preview-time">7:00 AM</span>
      </div>
      <div className="preview-row">
        <span className="preview-check" />
        <span className="preview-text">Finish the case study draft</span>
        <span className="preview-time">1:00 PM</span>
      </div>
      <div className="preview-row">
        <span className="preview-check" />
        <span className="preview-text">Read one chapter</span>
        <span className="preview-time">9:30 PM</span>
      </div>
    </div>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-form-col">{children}</div>

        <div className="auth-visual">
          <div>
            <p className="auth-kicker">Goal tracking that keeps score</p>
            <h2 className="auth-head">Know what to do today, and watch the chain grow.</h2>
          </div>

          <ProductPreview />

          <ul className="feat-list">
            {FEATURES.map((f) => (
              <li key={f.title} className="feat-row">
                <span className="feat-ic"><f.Icon size={14} /></span>
                <span>
                  <span className="feat-t">{f.title}</span>
                  <span className="feat-s">{f.sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function AuthBrand() {
  return (
    <div className="auth-brand">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
        <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>Goalsetter<span className="plus">+</span></span>
    </div>
  )
}
