// Floating Claude starburst toy: coral sunburst that bobs over a soft
// shadow and spins slowly. Pure SVG + CSS, used on the AI Coach tab.
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

export default function ClaudeMark({ size = 130 }) {
  return (
    <div className="claude-toy" aria-hidden="true">
      <div className="claude-float">
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {RAYS.map((r, i) => (
            <line
              key={i}
              x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="var(--claude)"
              strokeWidth="8.5"
              strokeLinecap="round"
            />
          ))}
          <circle cx="50" cy="50" r="6.5" fill="var(--claude)" />
        </svg>
      </div>
      <div className="claude-shadow" style={{ width: size * 0.5 }} />
      <div className="mono claude-tag">
        <span className="led claude-led" />CLAUDE ONLINE
      </div>
    </div>
  )
}
