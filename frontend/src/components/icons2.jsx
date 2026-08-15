// Extra icons used by the Today-first layout.
function Icon({ size = 16, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconMore = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconChevron = (p) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)

export const IconRetry = (p) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Icon>
)

export const IconOffline = (p) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M8.5 16.4a5 5 0 0 1 7 0" />
    <path d="M5 13a9.5 9.5 0 0 1 3.2-2.1M19 13a9.5 9.5 0 0 0-6.4-2.6" />
    <path d="M2 9.5A15 15 0 0 1 7 6.3M22 9.5a15 15 0 0 0-9.6-3.4" />
    <circle cx="12" cy="20" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconMenu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const IconSunrise = (p) => (
  <Icon {...p}>
    <path d="M12 4v3M5.6 9.6l2 2M18.4 9.6l-2 2M3 18h18M7 18a5 5 0 0 1 10 0" />
  </Icon>
)
