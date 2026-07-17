import { useState } from 'react'
import AccentPie from './AccentPie'
import { applyTheme, readTheme } from '../lib/theme'
import { IconCloud, IconMoon, IconSun } from './icons'

// Animated day/night pill switch: sky with a cloud in light mode,
// starfield in dark, with a sliding sun/moon thumb.
export function ThemeSwitch() {
  const [mode, setMode] = useState(() => readTheme().mode)
  const dark = mode === 'dark'

  return (
    <button
      type="button"
      className={`tswitch${dark ? ' is-dark' : ''}`}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setMode(applyTheme({ mode: dark ? 'light' : 'dark' }).mode)}
    >
      <span className="tsw-cloud"><IconCloud size={13} /></span>
      <span className="tsw-stars"><i /><i /><i /></span>
      <span className="tsw-thumb">
        <span className="tsw-sun"><IconSun size={13} /></span>
        <span className="tsw-moon"><IconMoon size={12} /></span>
      </span>
    </button>
  )
}

export default function ThemeControls() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="topbar-pie"><AccentPie /></span>
      <ThemeSwitch />
    </div>
  )
}
