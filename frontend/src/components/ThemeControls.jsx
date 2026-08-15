import { useState } from 'react'
import { applyTheme, readTheme } from '../lib/theme'
import { IconCloud, IconMoon, IconSun } from './icons'

// Animated day/night switch: sky and cloud in light, starfield in dark.
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

export default ThemeSwitch
