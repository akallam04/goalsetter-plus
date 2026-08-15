// A small pixel companion that idles in the AI Coach panel: it bobs,
// blinks and shuffles its feet. Built from rects so it stays crisp.
const P = 10 // pixel size in viewBox units

const BODY = [
  [2, 0], [3, 0], [4, 0], [5, 0],
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3],
  [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4],
]

const EYES = [[2, 2], [5, 2]]
const LEFT_FOOT = [[1, 5], [2, 5]]
const RIGHT_FOOT = [[5, 5], [6, 5]]

const rects = (cells, cls) =>
  cells.map(([x, y]) => (
    <rect key={`${cls}-${x}-${y}`} x={x * P} y={y * P} width={P} height={P} className={cls} />
  ))

export default function ClaudePixel({ size = 96 }) {
  return (
    <div className="cpix" style={{ width: size }} aria-hidden="true">
      <svg viewBox="0 0 80 60" width={size} height={size * 0.75} shapeRendering="crispEdges">
        <g className="cpix-body">
          {rects(BODY, 'cpix-fill')}
          {rects(EYES, 'cpix-eye')}
          <g className="cpix-foot-l">{rects(LEFT_FOOT, 'cpix-fill')}</g>
          <g className="cpix-foot-r">{rects(RIGHT_FOOT, 'cpix-fill')}</g>
        </g>
      </svg>
      <span className="cpix-shadow" />
    </div>
  )
}
