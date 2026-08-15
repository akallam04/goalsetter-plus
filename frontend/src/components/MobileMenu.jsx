import { useEffect } from 'react'
import { ThemeSwitch } from './ThemeControls'
import { IconHelp, IconLogout, IconUser, IconX } from './icons'

// Everything that used to crowd the mobile top bar now lives here,
// which is what removed the horizontal overflow.
export default function MobileMenu({ user, onClose, onProfile, onTour, onSignOut }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Menu">
        <div className="sheet-handle" />
        <div className="menu-head">
          <div className="menu-id">
            <span className="avatar">{user?.avatar ? <img src={user.avatar} alt="" /> : initials}</span>
            <span>
              <strong>{user?.name}</strong>
              <span className="menu-mail">{user?.email}</span>
            </span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu"><IconX size={18} /></button>
        </div>

        <div className="menu-block">
          <span className="menu-lbl">Appearance</span>
          <div className="menu-theme">
            <ThemeSwitch />
            <span className="menu-theme-hint">Dark and light</span>
          </div>
        </div>

        <div className="menu-block">
          <button className="menu-item" onClick={() => { onClose(); onProfile() }}>
            <IconUser size={17} /> Profile and account
          </button>
          <button className="menu-item" onClick={() => { onClose(); onTour() }}>
            <IconHelp size={17} /> Show me around
          </button>
          <button className="menu-item is-danger" onClick={onSignOut}>
            <IconLogout size={17} /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
