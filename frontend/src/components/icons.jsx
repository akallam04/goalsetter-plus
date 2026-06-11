// Hairline SVG icon set, 24px grid, stroke-based so icons inherit
// currentColor and match the instrument-panel aesthetic.
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

export const IconTarget = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </Icon>
)

export const IconChart = (p) => (
  <Icon {...p}>
    <path d="M4 19V10M10 19V5M16 19v-6M21 19H3" />
  </Icon>
)

export const IconSpark = (p) => (
  <Icon {...p}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
  </Icon>
)

export const IconLink = (p) => (
  <Icon {...p}>
    <path d="M10 14a5 5 0 0 0 7.1.4l3-3a5 5 0 0 0-7-7.1l-1.7 1.6" />
    <path d="M14 10a5 5 0 0 0-7.1-.4l-3 3a5 5 0 0 0 7 7.1l1.7-1.6" />
  </Icon>
)

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Icon>
)

export const IconPencil = (p) => (
  <Icon {...p}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Icon>
)

export const IconX = (p) => (
  <Icon {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
)

export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
)

export const IconFlame = (p) => (
  <Icon {...p}>
    <path d="M12 22c4.4 0 7-2.8 7-6.7 0-3.3-2.1-5.5-3.7-7.2-.8-.9-1.6-2-2.1-3.1-.2-.5-.9-.6-1.2-.1-.6 1-.9 2.4-.9 3.6-1.6-.6-2.6-2-3-3.4-.1-.5-.8-.7-1.1-.3C5.6 6.6 5 9.5 5 11.6 5 19.2 7.6 22 12 22z" />
  </Icon>
)

export const IconTrendUp = (p) => (
  <Icon {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Icon>
)

export const IconTrendDown = (p) => (
  <Icon {...p}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M15 17h6v-6" />
  </Icon>
)

export const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Icon>
)

export const IconCopy = (p) => (
  <Icon {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)

export const IconUndo = (p) => (
  <Icon {...p}>
    <path d="M3 7v6h6" />
    <path d="M3 13a9 9 0 1 0 3-7.7L3 7" />
  </Icon>
)

export const IconCalendar = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </Icon>
)

export const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 0 0 2 1.8h6A2 2 0 0 0 17 20l1-13" />
    <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
  </Icon>
)

export const IconRadar = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 12l6-6.5" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </Icon>
)

export const IconUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </Icon>
)

export const IconCamera = (p) => (
  <Icon {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2.5h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
)

export const IconLock = (p) => (
  <Icon {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </Icon>
)
