import { useMemo, useState } from 'react'
import { getQueryParams, getUrlParts, parseUrl } from './urlAnalysis.js'
import './UrlExplainer.css'

const PRESETS = [
  { label: 'Query params + fragment', value: 'https://example.com/search?q=hello+world&sort=desc&sort=asc#results' },
  { label: 'Port + auth', value: 'https://user:pass@localhost:8080/api/v1/users?active=true' },
  { label: 'No protocol', value: 'example.com/path?x=1' },
  { label: 'Malformed', value: 'not a url::' },
]

const URL_MAX_LENGTH = 2000
const SNIPPET_MAX_LENGTH = 5000

export default function UrlExplainer() {
  const [input, setInput] = useState(PRESETS[0].value)
  const [snippet, setSnippet] = useState('hello world & friends')
  const [mode, setMode] = useState('encode')

  const parsed = useMemo(() => parseUrl(input), [input])
  const parts = useMemo(() => (parsed.valid ? getUrlParts(parsed.url) : null), [parsed])
  const queryParams = useMemo(() => (parsed.valid ? getQueryParams(parsed.url) : null), [parsed])

  const snippetResult = useMemo(() => {
    try {
      const value = mode === 'encode' ? encodeURIComponent(snippet) : decodeURIComponent(snippet)
      return { valid: true, value }
    } catch (err) {
      return { valid: false, error: err.message }
    }
  }, [snippet, mode])

  return (
    <div className="url-explainer">
      <label className="url-input-label" htmlFor="url-input">
        URL
      </label>
      <input
        id="url-input"
        className="url-input"
        type="text"
        maxLength={URL_MAX_LENGTH}
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className={input.length >= URL_MAX_LENGTH * 0.9 ? 'char-count is-near-limit' : 'char-count'}>
        {input.length.toLocaleString()} / {URL_MAX_LENGTH.toLocaleString()}
      </div>

      <div className="url-presets">
        {PRESETS.map((preset) => (
          <button key={preset.label} type="button" className="url-preset-button" onClick={() => setInput(preset.value)}>
            {preset.label}
          </button>
        ))}
      </div>

      {!parsed.valid ? (
        <div className="url-error">
          <span className="url-section-icon" aria-hidden="true">⚠️</span>
          Can't parse this as a URL: {parsed.error}
        </div>
      ) : (
        <>
          {parsed.assumedProtocol && (
            <p className="url-note">No protocol was given, so this assumes "https://" to parse it.</p>
          )}

          <table className="url-breakdown" key={`${input}-parts`}>
            <tbody>
              {parts.map((part) => (
                <tr key={part.label}>
                  <td>{part.label}</td>
                  <td><code>{part.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="url-subheading">Query parameters</h3>
          {queryParams.length === 0 ? (
            <p className="url-empty">No query parameters.</p>
          ) : (
            <table className="url-breakdown" key={`${input}-query`}>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {queryParams.map((param, i) => (
                  <tr key={i}>
                    <td><code>{param.key}</code></td>
                    <td>{param.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <h3 className="url-subheading">Encode / decode text</h3>
      <div className="url-snippet-controls">
        <div className="url-mode-toggle">
          <button
            type="button"
            className={mode === 'encode' ? 'url-mode-button active' : 'url-mode-button'}
            onClick={() => setMode('encode')}
          >
            Encode
          </button>
          <button
            type="button"
            className={mode === 'decode' ? 'url-mode-button active' : 'url-mode-button'}
            onClick={() => setMode('decode')}
          >
            Decode
          </button>
        </div>
      </div>
      <input
        className="url-input"
        type="text"
        maxLength={SNIPPET_MAX_LENGTH}
        spellCheck={false}
        value={snippet}
        onChange={(e) => setSnippet(e.target.value)}
      />
      <div className={snippet.length >= SNIPPET_MAX_LENGTH * 0.9 ? 'char-count is-near-limit' : 'char-count'}>
        {snippet.length.toLocaleString()} / {SNIPPET_MAX_LENGTH.toLocaleString()}
      </div>
      {snippetResult.valid ? (
        <pre className="url-output"><code>{snippetResult.value}</code></pre>
      ) : (
        <div className="url-error">
          <span className="url-section-icon" aria-hidden="true">⚠️</span>
          Can't decode this: {snippetResult.error}
        </div>
      )}
    </div>
  )
}
