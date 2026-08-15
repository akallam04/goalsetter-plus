// Two themes, nothing else to configure. The mode is applied before first
// paint by the inline script in index.html and persisted here.
const KEY = 'gs-theme'

export const readTheme = () => ({
  mode: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
})

export const applyTheme = ({ mode }) => {
  const next = mode === 'light' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(KEY, JSON.stringify({ mode: next }))
  } catch { /* storage unavailable: theme still applies for this session */ }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.content = next === 'light' ? '#f1f2ee' : '#07090c'
  return { mode: next }
}
