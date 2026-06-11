// SVG completion ring with a mono percentage readout in the center
export default function ProgressRing({ value = 0, size = 52, stroke = 4.5 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c * (1 - clamped / 100)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--line)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--acc)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s var(--ease)' }}
        />
      </svg>
      <div
        className="mono"
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.24, fontWeight: 700,
        }}
      >
        {clamped}<span style={{ fontSize: size * 0.16, color: 'var(--dim)' }}>%</span>
      </div>
    </div>
  )
}
