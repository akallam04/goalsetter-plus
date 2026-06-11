import { useEffect, useMemo, useRef, useState } from 'react'

const M = { top: 14, right: 10, bottom: 24, left: 30 }

// Hand-rolled SVG area chart: lime line, soft gradient fill,
// pointer crosshair with a mono tooltip. No chart library needed.
export default function AreaChart({ data, height = 240 }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const plot = useMemo(() => {
    if (!width || data.length < 2) return null
    const innerW = width - M.left - M.right
    const innerH = height - M.top - M.bottom
    const maxY = Math.max(3, ...data.map((d) => d.count))
    const yStep = maxY <= 4 ? 1 : Math.ceil(maxY / 4)
    const yTop = Math.ceil(maxY / yStep) * yStep

    const x = (i) => M.left + (i / (data.length - 1)) * innerW
    const y = (v) => M.top + innerH * (1 - v / yTop)

    const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.count).toFixed(1)}`).join('')
    const area = `${line}L${x(data.length - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`

    const yTicks = []
    for (let v = 0; v <= yTop; v += yStep) yTicks.push(v)

    const tickCount = Math.min(data.length, width < 460 ? 4 : 6)
    const xTicks = Array.from({ length: tickCount }, (_, i) =>
      Math.round((i / (tickCount - 1)) * (data.length - 1))
    )

    return { x, y, line, area, yTicks, xTicks, innerH }
  }, [width, data, height])

  const onMove = (e) => {
    if (!plot) return
    const rect = wrapRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const ratio = (px - M.left) / (width - M.left - M.right)
    const i = Math.round(ratio * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', height, touchAction: 'pan-y' }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      {plot && (
        <svg width={width} height={height} style={{ display: 'block' }} aria-hidden="true">
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(180,245,60,0.28)" />
              <stop offset="100%" stopColor="rgba(180,245,60,0)" />
            </linearGradient>
          </defs>

          {plot.yTicks.map((v) => (
            <g key={v}>
              <line
                x1={M.left} x2={width - M.right}
                y1={plot.y(v)} y2={plot.y(v)}
                stroke="var(--line)" strokeDasharray={v === 0 ? '' : '3 5'}
              />
              <text
                x={M.left - 8} y={plot.y(v) + 3}
                textAnchor="end" fill="var(--dim)"
                fontSize="9" fontFamily="var(--font-mono)"
              >
                {v}
              </text>
            </g>
          ))}

          {plot.xTicks.map((i) => (
            <text
              key={i}
              x={plot.x(i)} y={height - 7}
              textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
              fill="var(--dim)"
              fontSize="9" fontFamily="var(--font-mono)"
            >
              {data[i].label.toUpperCase()}
            </text>
          ))}

          <path d={plot.area} fill="url(#areaFill)" />
          <path d={plot.line} fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinejoin="round" />

          {hover !== null && (
            <g>
              <line
                x1={plot.x(hover)} x2={plot.x(hover)}
                y1={M.top} y2={height - M.bottom}
                stroke="var(--line-2)"
              />
              <circle
                cx={plot.x(hover)} cy={plot.y(data[hover].count)} r="4"
                fill="var(--bg)" stroke="var(--acc)" strokeWidth="2"
              />
            </g>
          )}
        </svg>
      )}

      {plot && hover !== null && (
        <div
          className="mono"
          style={{
            position: 'absolute',
            top: 0,
            left: Math.min(Math.max(plot.x(hover) - 60, 0), width - 130),
            background: 'var(--panel-3)',
            border: '1px solid var(--line-2)',
            borderRadius: 7,
            padding: '4px 9px',
            fontSize: 10.5,
            letterSpacing: '0.05em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {data[hover].label.toUpperCase()} · <span style={{ color: 'var(--acc)' }}>{data[hover].count} DONE</span>
        </div>
      )}
    </div>
  )
}
