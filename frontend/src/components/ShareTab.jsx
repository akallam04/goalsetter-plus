import { useState } from 'react'
import client from '../api/client'
import Gyro from './Gyro'
import { IconCheck, IconCopy, IconLink } from './icons'

export default function ShareTab({ onToast }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  const url = token ? `${window.location.origin}/share/${token}` : null

  const generate = async () => {
    setLoading(true)
    try {
      const { data } = await client.post('/share/generate', {})
      setToken(data.token)
    } catch {
      onToast('Could not generate link', 'error')
    } finally {
      setLoading(false)
    }
  }

  const revoke = async () => {
    try {
      await client.delete('/share/revoke')
      setToken(null)
      setConfirmRevoke(false)
      onToast('Share link revoked')
    } catch {
      onToast('Could not revoke link', 'error')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onToast('Copy failed', 'error')
    }
  }

  return (
    <div className="panel panel-tick">
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="panel-head" style={{ marginBottom: 6 }}>
            <div>
              <div className="mono-label" style={{ marginBottom: 3 }}>Public broadcast</div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconLink size={16} style={{ color: 'var(--acc)' }} /> Share Your Board
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--mut)', fontSize: 13.5, margin: '0 0 16px', lineHeight: 1.6, maxWidth: 560 }}>
            Create a read-only link to your goals for accountability partners, mentors,
            or anyone you want in your corner. No account needed to view.
            Generating a new link retires the old one, and you can revoke access anytime.
          </p>

          {!token ? (
            <button className="btn-primary" style={{ padding: '12px 24px' }} onClick={generate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="mono-label">LIVE LINK</div>
              <div
                className="mono"
                style={{
                  padding: '12px 15px',
                  borderRadius: 'var(--r-s)',
                  background: '#0a0d11',
                  border: '1px solid var(--acc-30)',
                  fontSize: 12.5,
                  color: 'var(--acc)',
                  wordBreak: 'break-all',
                  lineHeight: 1.6,
                }}
              >
                {url}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn-ghost-acc" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={copy}>
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                {confirmRevoke ? (
                  <>
                    <button className="btn-danger" onClick={revoke}>Confirm Revoke</button>
                    <button onClick={() => setConfirmRevoke(false)}>Keep Link</button>
                  </>
                ) : (
                  <button className="btn-danger" onClick={() => setConfirmRevoke(true)}>Revoke</button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="desktop-only" style={{ padding: '10px 26px 10px 0' }}>
          <Gyro size={170} />
        </div>
      </div>
    </div>
  )
}
