import { useEffect, useRef, useState } from 'react'
import { ACCENTS, applyTheme, readTheme } from '../lib/theme'

// Per-mode swatches so the pie previews the color you would actually get
const SWATCH = {
  ice: { dark: '#5fd4ff', light: '#0369a1' },
  lime: { dark: '#b4f53c', light: '#4d7c0f' },
  amber: { dark: '#ffb454', light: '#b45309' },
  coral: { dark: '#ff8a68', light: '#c2410c' },
}

const RAD = Math.PI / 180

// Donut slice path between two angles (degrees)
const slice = (a0, a1, r1, r2) => {
  const p = (r, a) => `${50 + r * Math.cos(a * RAD)},${50 + r * Math.sin(a * RAD)}`
  return `M${p(r2, a0)}A${r2},${r2} 0 0 1 ${p(r2, a1)}L${p(r1, a1)}A${r1},${r1} 0 0 0 ${p(r1, a0)}Z`
}

function PieWheel({ accent, mode, onPick, size = 128 }) {
  const [hovered, setHovered] = useState(null)
  const label = hovered || accent

  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {ACCENTS.map((a, i) => {
            const active = accent === a.id
            const a0 = -135 + i * 90 + 2.5
            const a1 = -45 + i * 90 - 2.5
            return (
              <path
                key={a.id}
                d={slice(a0, a1, 24, active ? 48 : 43)}
                fill={SWATCH[a.id][mode]}
                opacity={hovered && hovered !== a.id ? 0.45 : 1}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s, d 0.2s' }}
                onMouseEnter={() => setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onPick(a.id)}
                role="button"
                aria-label={`${a.label} accent`}
              />
            )
          })}
        </svg>
        <span
          className="mono"
          style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            fontSize: 8.5, fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'var(--mut)',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

// Compact conic-ring trigger that opens the pie; `inline` renders the
// wheel directly (used inside the mobile profile sheet).
export default function AccentPie({ inline = false }) {
  const [accent, setAccent] = useState(() => readTheme().accent)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const mode = readTheme().mode

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (id) => setAccent(applyTheme({ accent: id }).accent)

  if (inline) {
    return <PieWheel accent={accent} mode={mode} onPick={pick} />
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="pie-trigger"
        aria-label="Choose accent color"
        aria-expanded={open}
        title="Accent color"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: `conic-gradient(from -135deg, ${ACCENTS.map((a, i) =>
            `${SWATCH[a.id][mode]} ${i * 90}deg ${(i + 1) * 90}deg`).join(', ')})`,
        }}
      >
        <span className="pie-hole" />
        <span className="pie-dot" style={{ background: SWATCH[accent][mode] }} />
      </button>

      {open && (
        <div className="pie-pop">
          <div className="mono-label" style={{ textAlign: 'center', marginBottom: 4 }}>ACCENT</div>
          <PieWheel accent={accent} mode={mode} onPick={pick} />
        </div>
      )}
    </div>
  )
}
