import { useMemo, useState } from 'react'
import { buildSampleJwt, describeClaim, getExpiryStatus, parseJwt } from './jwtAnalysis.js'
import './JwtExplainer.css'

const now = Math.floor(Date.now() / 1000)

const PRESETS = [
  {
    label: 'Classic example',
    value:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  {
    label: 'Valid (expires in an hour)',
    value: buildSampleJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: '1234567890', name: 'Jane Doe', roles: ['admin', 'editor'], iat: now, exp: now + 3600 },
    ),
  },
  {
    label: 'Expired',
    value: buildSampleJwt(
      { alg: 'HS256', typ: 'JWT' },
      { sub: '1234567890', name: 'Jane Doe', iat: now - 7200, exp: now - 3600 },
    ),
  },
  { label: 'Malformed', value: 'not-a-real.jwt' },
]

const STATUS_ICON = { active: '✅', expired: '⛔', none: 'ℹ️' }
const MAX_LENGTH = 20000

export default function JwtExplainer() {
  const [token, setToken] = useState(PRESETS[1].value)
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => parseJwt(token), [token])
  const expiry = useMemo(() => (parsed.valid ? getExpiryStatus(parsed.payload) : null), [parsed])

  const handleCopy = async () => {
    if (!parsed.valid) return
    await navigator.clipboard.writeText(JSON.stringify(parsed.payload, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="jwt-explainer">
      <label className="jwt-input-label" htmlFor="jwt-input">
        JWT
      </label>
      <textarea
        id="jwt-input"
        className="jwt-input"
        spellCheck={false}
        maxLength={MAX_LENGTH}
        rows={4}
        value={token}
        onChange={(e) => {
          setToken(e.target.value)
          setCopied(false)
        }}
      />
      <div className={token.length >= MAX_LENGTH * 0.9 ? 'char-count is-near-limit' : 'char-count'}>
        {token.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
      </div>

      <div className="jwt-presets">
        {PRESETS.map((preset) => (
          <button key={preset.label} type="button" className="jwt-preset-button" onClick={() => setToken(preset.value)}>
            {preset.label}
          </button>
        ))}
      </div>

      <p className="jwt-privacy-note">
        Decoding happens entirely in your browser — nothing is sent anywhere. Still, avoid pasting tokens from real
        production systems.
      </p>

      {!parsed.valid ? (
        <div className="jwt-error">
          <span className="jwt-section-icon" aria-hidden="true">⚠️</span>
          Can't decode this token: {parsed.error}
        </div>
      ) : (
        <>
          <div className={`jwt-expiry-banner jwt-expiry-${expiry.state}`} key={token}>
            <span className="jwt-section-icon" aria-hidden="true">{STATUS_ICON[expiry.state]}</span>
            {expiry.message}
          </div>

          <table className="jwt-breakdown" key={`${token}-claims`}>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Meaning</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(parsed.payload).map(([key, value]) => {
                const { label, preview } = describeClaim(key, value)
                return (
                  <tr key={key}>
                    <td><code>{key}</code></td>
                    <td>{label}</td>
                    <td>{preview}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="jwt-output-header">
            <h3>Header</h3>
          </div>
          <pre className="jwt-output"><code>{JSON.stringify(parsed.header, null, 2)}</code></pre>

          <div className="jwt-output-header">
            <h3>Payload</h3>
            <button type="button" className="jwt-copy-button" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="jwt-output"><code>{JSON.stringify(parsed.payload, null, 2)}</code></pre>

          <div className="jwt-output-header">
            <h3>Signature</h3>
          </div>
          <p className="jwt-signature-note">
            Signatures can't be verified here — that requires the issuer's secret or public key, which never belongs
            in a browser tool.
          </p>
          <pre className="jwt-output"><code>{parsed.signature}</code></pre>
        </>
      )}
    </div>
  )
}
