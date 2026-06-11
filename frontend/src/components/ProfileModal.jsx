import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateProfile } from '../features/auth/authSlice'
import { IconCamera, IconLock, IconUser, IconX } from './icons'

const AVATAR_SIZE = 144

// Center-crop the chosen image to a small square JPEG data URL so it
// stays a few kilobytes and fits in the user document.
const fileToAvatar = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file is not a valid image'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = AVATAR_SIZE
        canvas.height = AVATAR_SIZE
        const ctx = canvas.getContext('2d')
        const side = Math.min(img.width, img.height)
        ctx.drawImage(
          img,
          (img.width - side) / 2, (img.height - side) / 2, side, side,
          0, 0, AVATAR_SIZE, AVATAR_SIZE
        )
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })

export default function ProfileModal({ user, onClose, onToast }) {
  const dispatch = useDispatch()
  const fileRef = useRef(null)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    try {
      const dataUrl = await fileToAvatar(file)
      if (dataUrl.length > 110000) throw new Error('Image is too large after resize, try another one')
      setAvatar(dataUrl)
    } catch (err) {
      setError(err.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (newPassword && !currentPassword) {
      setError('Enter your current password to set a new one')
      return
    }
    const payload = { name, email, avatar }
    if (newPassword) {
      payload.currentPassword = currentPassword
      payload.newPassword = newPassword
    }
    setSaving(true)
    const res = await dispatch(updateProfile(payload))
    setSaving(false)
    if (updateProfile.fulfilled.match(res)) {
      onToast('Profile updated')
      onClose()
    } else {
      setError(res.payload || 'Could not save changes')
    }
  }

  const initials = (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="panel-head" style={{ marginBottom: 14 }}>
          <div>
            <div className="mono-label" style={{ marginBottom: 3 }}>Operator profile</div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconUser size={16} style={{ color: 'var(--acc)' }} /> Your Account
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconX size={17} />
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="avatar avatar-xl">
              {avatar ? <img src={avatar} alt="Your avatar" /> : initials}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={pickFile}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-ghost-acc"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                onClick={() => fileRef.current?.click()}
              >
                <IconCamera size={14} /> Upload photo
              </button>
              {avatar && (
                <button type="button" onClick={() => setAvatar('')}>Remove</button>
              )}
            </div>
          </div>

          <div>
            <label className="label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          {/* Password */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 13 }}>
            <div className="mono-label" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconLock size={12} /> CHANGE PASSWORD (OPTIONAL)
            </div>
            <div className="form-grid-2">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Required to change"
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="mono"
              style={{
                padding: '10px 13px', fontSize: 12,
                color: 'var(--red)', background: 'var(--red-bg)',
                border: '1px solid var(--red-bd)', borderRadius: 'var(--r-s)',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 2 }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '11px 26px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
