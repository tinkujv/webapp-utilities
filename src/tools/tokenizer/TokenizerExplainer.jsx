import { useMemo, useState } from 'react'
import { ENCODINGS, tokenize } from './tokenizerAnalysis.js'
import './TokenizerExplainer.css'

const DEFAULT_TEXT = "The quick brown fox jumps over the lazy dog. Tokenizers don't split on whitespace alone!"

export default function TokenizerExplainer() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [encodingKey, setEncodingKey] = useState('cl100k_base')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => tokenize(text, encodingKey), [text, encodingKey])
  const charsPerToken = result.total > 0 ? (text.length / result.total).toFixed(2) : '0'

  const handleCopy = async () => {
    if (result.ids.length === 0) return
    await navigator.clipboard.writeText(JSON.stringify(result.ids))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="tok-explainer">
      <label className="tok-input-label" htmlFor="tok-input">
        Text to tokenize
      </label>
      <textarea
        id="tok-input"
        className="tok-input"
        spellCheck={false}
        maxLength={20000}
        rows={5}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setCopied(false)
        }}
      />

      <div className="tok-controls">
        <label className="tok-select-label" htmlFor="tok-encoding">
          Tokenizer
        </label>
        <select
          id="tok-encoding"
          className="tok-select"
          value={encodingKey}
          onChange={(e) => setEncodingKey(e.target.value)}
        >
          {Object.entries(ENCODINGS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <p className="tok-note">
        Runs entirely in your browser — nothing is sent anywhere. This shows OpenAI's tokenizer; other models (Claude,
        open-weight models) split text differently, so counts here won't match them exactly.
      </p>

      <div className="tok-stats">
        <div className="tok-stat">
          <span className="tok-stat-value">{text.length}</span>
          <span className="tok-stat-label">characters</span>
        </div>
        <div className="tok-stat">
          <span className="tok-stat-value">{result.total}</span>
          <span className="tok-stat-label">tokens</span>
        </div>
        <div className="tok-stat">
          <span className="tok-stat-value">{charsPerToken}</span>
          <span className="tok-stat-label">chars/token</span>
        </div>
      </div>

      <div className="tok-output-header">
        <h3>Tokens</h3>
        <button type="button" className="tok-copy-button" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy token IDs'}
        </button>
      </div>

      {result.tokens.length === 0 ? (
        <p className="tok-empty">Type something above to see how it tokenizes.</p>
      ) : (
        <div className="tok-tokens">
          {result.tokens.map((token, i) => (
            <span key={i} className="tok-chip" title={`id ${token.id}`}>
              {token.text}
            </span>
          ))}
        </div>
      )}
      {result.truncated && (
        <p className="tok-more-note">
          Showing the first {result.tokens.length} of {result.total} tokens — "Copy token IDs" still copies all of
          them.
        </p>
      )}
    </div>
  )
}
