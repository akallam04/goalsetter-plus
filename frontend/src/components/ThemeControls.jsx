import { useState } from 'react'
import { ACCENTS, applyTheme, readTheme } from '../lib/theme'
import { IconMoon, IconSun } from './icons'

// Sun/moon button: shows the mode you will switch to
export function ModeToggle() {
  const [mode, setMode] = useState(() => readTheme().mode)
  const next = mode === 'dark' ? 'light' : 'dark'
  return (
    <button
      className="icon-btn"
      onClick={() => setMode(applyTheme({ mode: next }).mode)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {mode === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
    </button>
  )
}

export function AccentDots({ className = '' }) {
  const [accent, setAccent] = useState(() => readTheme().accent)
  return (
    <div className={`acc-dots ${className}`.trim()} role="radiogroup" aria-label="Accent color">
      {ACCENTS.map((a) => (
        <button
          key={a.id}
          role="radio"
          aria-checked={accent === a.id}
          aria-label={`${a.label} accent`}
          title={a.label}
          className={`acc-dot a-${a.id}${accent === a.id ? ' on' : ''}`}
          onClick={() => setAccent(applyTheme({ accent: a.id }).accent)}
        />
      ))}
    </div>
  )
}

export default function ThemeControls() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <AccentDots className="topbar-dots" />
      <ModeToggle />
    </div>
  )
}
