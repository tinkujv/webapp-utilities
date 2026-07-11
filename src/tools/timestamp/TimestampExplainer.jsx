import { useEffect, useMemo, useState } from 'react'
import { describeDate, parseTimestampInput } from './timestampAnalysis.js'
import './TimestampExplainer.css'

const PRESETS = [
  { label: 'Now', value: () => String(Math.floor(Date.now() / 1000)) },
  { label: 'Unix epoch (0)', value: () => '0' },
  { label: 'Y2K', value: () => '2000-01-01T00:00:00Z' },
  { label: 'One hour from now', value: () => String(Math.floor(Date.now() / 1000) + 3600) },
  { label: 'One day ago', value: () => String(Math.floor(Date.now() / 1000) - 86400) },
]

export default function TimestampExplainer() {
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [liveNow, setLiveNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setLiveNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const parsed = useMemo(() => parseTimestampInput(input), [input])
  const info = useMemo(() => (parsed.valid ? describeDate(parsed.date) : null), [parsed])

  return (
    <div className="ts-explainer">
      <div className="ts-live-clock">
        <span className="ts-section-icon" aria-hidden="true">🕒</span>
        Right now: <code>{Math.floor(liveNow / 1000)}</code> · {new Date(liveNow).toLocaleString()}
      </div>

      <label className="ts-input-label" htmlFor="ts-input">
        Timestamp or date
      </label>
      <input
        id="ts-input"
        className="ts-input"
        type="text"
        maxLength={200}
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p className="ts-hint">
        Paste a Unix timestamp (seconds or milliseconds) or a date string (e.g. "2026-01-01", "Jan 1 2026") — this
        detects which one it is and converts the other way.
      </p>

      <div className="ts-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="ts-preset-button"
            onClick={() => setInput(preset.value())}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!parsed.valid ? (
        <div className="ts-error">
          <span className="ts-section-icon" aria-hidden="true">⚠️</span>
          Can't parse this as a timestamp or date: {parsed.error}
        </div>
      ) : (
        <>
          <div className="ts-relative-banner" key={input}>
            <span className="ts-section-icon" aria-hidden="true">📅</span>
            {info.relative} <span className="ts-detected-as">(read as {parsed.detectedAs})</span>
          </div>

          <table className="ts-breakdown" key={`${input}-table`}>
            <tbody>
              {info.rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td><code>{row.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
