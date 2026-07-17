import { useCallback, useEffect, useRef, useState } from 'react'

const TIP_W = 320
const TIP_H = 175
const GAP = 14

const STEPS = [
  {
    targets: ['[data-tour="new-goal"]', '[data-tour="fab"]'],
    title: 'Set a goal',
    body: 'Type an objective, pick a priority, and set a target date. Natural language works too: "next friday" or "in 2 weeks" locks in automatically.',
  },
  {
    targets: ['[data-tour="goal-list"]'],
    title: 'Track everything here',
    body: 'Complete, edit, or break goals into subtasks. Smart sort keeps overdue and due-soon work on top, with search and filters alongside.',
  },
  {
    targets: ['[data-tour="tab-analytics"]'],
    title: 'Watch your momentum',
    body: 'A 13-week completion heatmap, streak counter, and trend charts show how consistent you really are.',
  },
  {
    targets: ['[data-tour="tab-ai"]'],
    title: 'Ask the AI Coach',
    body: 'Claude turns a plain-English intent like "get healthier" into three SMART goals you can add to your board in one tap.',
  },
  {
    targets: ['[data-tour="tab-share"]'],
    title: 'Share your board',
    body: 'Generate a public read-only link for accountability partners or your portfolio. Revoke it anytime.',
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
export default function FeatureTour({ onDone }) {
  const [idx, setIdx] = useState(0)
  const [rect, setRect] = useState(null)
  const rafRef = useRef(0)

  const measure = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      setRect(findTarget(STEPS[idx].targets))
    })
  }, [idx])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      cancelAnimationFrame(rafRef.current)
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
