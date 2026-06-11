// Split-panel auth shell: form on the left, animated radar visual
// on the right (hidden on small screens).
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-form-col">{children}</div>

        <div className="auth-visual" aria-hidden="true">
          <div>
            <div className="mono-label" style={{ color: 'var(--acc)' }}>SYSTEM ONLINE</div>
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 6, letterSpacing: '-0.01em' }}>
              Precision goal tracking
            </div>
          </div>

          <div className="radar">
            <div className="sweep" />
            <div className="cross-v" />
            <div className="cross-h" />
            <div className="core" />
            <div className="blip" style={{ top: '24%', left: '62%' }} />
            <div className="blip" style={{ top: '64%', left: '30%', animationDelay: '0.8s' }} />
            <div className="blip" style={{ top: '40%', left: '18%', animationDelay: '1.6s' }} />
          </div>

          <div style={{ display: 'grid', gap: 9 }}>
            {[
              'AI coach powered by Claude',
              'Streak and momentum analytics',
              'Shareable accountability links',
            ].map((f) => (
              <div
                key={f}
                className="mono"
                style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mut)' }}
              >
                <span className="led" style={{ width: 5, height: 5 }} />{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="10" fill="none" stroke="var(--acc)" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="3.6" fill="var(--acc)" />
        <path d="M16 1.5v5M16 25.5v5M1.5 16h5M25.5 16h5" stroke="var(--acc)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
        Goalsetter<span style={{ color: 'var(--acc)' }}>+</span>
      </span>
    </div>
  )
}
