// Theme state lives on <html> as data attributes, set before first paint
// by the inline script in index.html and persisted to localStorage here.
const KEY = 'gs-theme'

export const ACCENTS = [
  { id: 'lime', label: 'Lime' },
  { id: 'ice', label: 'Ice' },
  { id: 'amber', label: 'Amber' },
  { id: 'coral', label: 'Coral' },
]

export const readTheme = () => {
  const ds = document.documentElement.dataset
  return {
    mode: ds.theme === 'light' ? 'light' : 'dark',
    accent: ACCENTS.some((a) => a.id === ds.accent) ? ds.accent : 'lime',
  }
}

export const applyTheme = (patch) => {
  const next = { ...readTheme(), ...patch }
  const root = document.documentElement
  root.dataset.theme = next.mode
  root.dataset.accent = next.accent
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* storage unavailable: theme still applies for this session */ }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = next.mode === 'light' ? '#f1f2ee' : '#07090c'
  return next
}
