// The Claude "thinking" artifact: the coral starburst gently pulsing
// while it spins, like the Claude Code activity spinner.
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * 30 * Math.PI) / 180
  const inner = 13
  const outer = i % 2 === 0 ? 46 : 34
  return {
    x1: 50 + inner * Math.cos(angle),
    y1: 50 + inner * Math.sin(angle),
    x2: 50 + outer * Math.cos(angle),
    y2: 50 + outer * Math.sin(angle),
  }
})

export default function ClaudeSpin({ size = 26 }) {
  return (
    <span className="claude-spin" aria-hidden="true">
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {RAYS.map((r, i) => (
          <line
            key={i}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke="var(--claude)"
            strokeWidth="9"
            strokeLinecap="round"
          />
        ))}
        <circle cx="50" cy="50" r="7" fill="var(--claude)" />
      </svg>
    </span>
  )
}
