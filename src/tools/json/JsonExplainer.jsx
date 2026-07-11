import { useMemo, useState } from 'react'
import { detectTrailingComma, parseJsonError, summarizeTopLevel } from './jsonAnalysis.js'
import './JsonExplainer.css'

const PRESETS = [
  { label: 'Simple object', value: '{\n  "name": "Ada Lovelace",\n  "born": 1815,\n  "active": true\n}' },
  {
    label: 'Nested object',
    value: '{\n  "user": {\n    "id": 42,\n    "roles": ["admin", "editor"]\n  },\n  "createdAt": "2026-01-01"\n}',
  },
  { label: 'Array of records', value: '[\n  { "id": 1, "name": "Alpha" },\n  { "id": 2, "name": "Beta" }\n]' },
  { label: 'Broken JSON', value: '{\n  "name": "Ada",\n  "born": 1815,\n}' },
]

const KIND_LABEL = {
  object: (total) => `object with ${total} key${total === 1 ? '' : 's'}`,
  array: (total) => `array with ${total} item${total === 1 ? '' : 's'}`,
}

export default function JsonExplainer() {
  const [input, setInput] = useState(PRESETS[1].value)
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(input)
      return { valid: true, value, formatted: JSON.stringify(value, null, 2) }
    } catch (err) {
      return {
        valid: false,
        error: err.message,
        location: parseJsonError(input, err.message),
        hint: detectTrailingComma(input),
      }
    }
  }, [input])

  const summary = useMemo(() => (parsed.valid ? summarizeTopLevel(parsed.value) : null), [parsed])

  const handleCopy = async () => {
    if (!parsed.valid) return
    await navigator.clipboard.writeText(parsed.formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="json-explainer">
      <label className="json-input-label" htmlFor="json-input">
        JSON input
      </label>
      <textarea
        id="json-input"
        className="json-input"
        spellCheck={false}
        rows={10}
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setCopied(false)
        }}
      />

      <div className="json-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="json-preset-button"
            onClick={() => setInput(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!parsed.valid ? (
        <div className="json-error">
          <span className="json-section-icon" aria-hidden="true">⚠️</span>
          Can't parse this JSON: {parsed.error}
          {parsed.location && (
            <div className="json-error-location">
              Line {parsed.location.line}, column {parsed.location.column}
            </div>
          )}
          {parsed.hint && <div className="json-error-hint">💡 {parsed.hint}</div>}
        </div>
      ) : (
        <>
          <div className="json-valid-banner" key={input}>
            <span className="json-section-icon" aria-hidden="true">✅</span>
            Valid JSON — {KIND_LABEL[summary.kind]?.(summary.total) ?? `a single ${summary.rows[0].type} value`}
          </div>

          <table className="json-breakdown" key={`${input}-table`}>
            <thead>
              <tr>
                <th>{summary.kind === 'array' ? 'Index' : 'Key'}</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr key={row.key}>
                  <td><code>{row.key}</code></td>
                  <td>{row.type}</td>
                  <td>{row.preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {summary.total > summary.rows.length && (
            <p className="json-more-note">…and {summary.total - summary.rows.length} more</p>
          )}

          <div className="json-output-header">
            <h3>Formatted</h3>
            <button type="button" className="json-copy-button" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="json-output"><code>{parsed.formatted}</code></pre>
        </>
      )}
    </div>
  )
}
