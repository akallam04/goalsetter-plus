import { useCallback, useEffect, useState } from 'react'

const TIP_W = 320
const TIP_H = 175
const GAP = 14

const STEPS = [
  {
    targets: ['[data-tour="quick-add"]'],
    title: 'Add a goal in one line',
    body: 'Type it and press Enter. Say "gym tomorrow" and the date is picked up for you, or tap a date chip.',
  },
  {
    targets: ['[data-tour="focus"]'],
    title: 'Today is the whole point',
    body: 'Overdue and due-today work sits at the top. Tap the circle to complete something, or open the steps inside a goal to tick them off.',
  },
  {
    targets: ['[data-tour="tab-progress"]'],
    title: 'Watch the chain grow',
    body: 'A 13-week heatmap, streaks, and momentum trends show how consistent you have actually been.',
  },
  {
    targets: ['[data-tour="tab-coach"]'],
    title: 'Ask the AI coach',
    body: 'Claude turns a vague intent like "get healthier" into three specific goals you can add in one tap.',
  },
  {
    targets: ['[data-tour="tab-share"]'],
    title: 'Share your progress',
    body: 'Generate a public read-only link for an accountability partner. Revoke it whenever you want.',
  },
]

const findTarget = (selectors) => {
  for (const sel of selectors) {
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect()
      if (r.width > 4 && r.height > 4) return r
    }
  }
  return null
}

// Lightweight spotlight tour: dims the app with a cutout around the
// current target and anchors an explainer card next to it.
export default function FeatureTour({ onDone, onNavigate }) {
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState(null)

  // Measured synchronously: requestAnimationFrame is paused while a tab
  // is hidden, which would leave the spotlight unpositioned
  const measure = useCallback(() => {
    const next = findTarget(STEPS[idx].targets)
    setRect((prev) => {
      if (prev && next && prev.top === next.top && prev.left === next.left
        && prev.width === next.width && prev.height === next.height) return prev
      return next
    })
  }, [idx])

  // Steps one and two point at the Today screen, so make sure we are on it
  useEffect(() => {
    onNavigate?.('today')
  }, [onNavigate])

  useEffect(() => {
    // The target may arrive a frame or two late, for example right after
    // the tour switches views, so measure on the next tick and keep
    // re-measuring while the tour is open
    const first = setTimeout(measure, 0)
    const poll = setInterval(measure, 250)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      clearTimeout(first)
      clearInterval(poll)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onDone() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])

  const next = () => {
    if (idx >= STEPS.length - 1) onDone()
    else setIdx(idx + 1)
  }

  const step = STEPS[idx]
  const vw = window.innerWidth
  const vh = window.innerHeight
  const tipW = Math.min(TIP_W, vw - 28)

  let tipTop
  let tipLeft
  if (rect) {
    if (rect.right + GAP + tipW <= vw - 14) {
      tipLeft = rect.right + GAP
      tipTop = Math.min(Math.max(rect.top, 14), vh - TIP_H - 14)
    } else if (rect.left - GAP - tipW >= 14) {
      tipLeft = rect.left - GAP - tipW
      tipTop = Math.min(Math.max(rect.top, 14), vh - TIP_H - 14)
    } else {
      tipLeft = Math.min(Math.max(rect.left + rect.width / 2 - tipW / 2, 14), vw - tipW - 14)
      tipTop = rect.bottom + GAP + TIP_H <= vh
        ? rect.bottom + GAP
        : Math.max(rect.top - TIP_H - GAP, 14)
    }
  } else {
    tipLeft = vw / 2 - tipW / 2
    tipTop = vh / 2 - TIP_H / 2
  }

  return (
    <>
      {rect && (
        <div
          className="tour-hi"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}
      <div className="tour-tip" style={{ top: tipTop, left: tipLeft, width: tipW }}>
        <span className="chip chip-acc">{idx + 1} OF {STEPS.length}</span>
        <div style={{ fontSize: 16, fontWeight: 700, margin: '10px 0 6px' }}>{step.title}</div>
        <div style={{ fontSize: 13, color: 'var(--mut)', lineHeight: 1.55 }}>{step.body}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <button
            onClick={onDone}
            style={{ border: 'none', background: 'none', padding: '4px 2px', color: 'var(--dim)', fontSize: 12.5 }}
          >
            Skip all
          </button>
          <button className="btn-primary" style={{ padding: '9px 22px' }} onClick={next}>
            {idx === STEPS.length - 1 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
