// Small helpers that turn a parsed JSON value (or a JSON.parse error) into
// something a person can read at a glance — mirrors the role cronFields.js
// plays for the cron tool: no dependency needed, the logic is tiny.

const MAX_ROWS = 25

function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

export function describeValue(value) {
  if (value === null) return { type: 'null', preview: 'null' }
  if (Array.isArray(value)) {
    return { type: 'array', preview: `${value.length} item${value.length === 1 ? '' : 's'}` }
  }
  switch (typeof value) {
    case 'object':
      return { type: 'object', preview: `${Object.keys(value).length} key${Object.keys(value).length === 1 ? '' : 's'}` }
    case 'string':
      return { type: 'string', preview: truncate(JSON.stringify(value), 60) }
    case 'number':
      return { type: 'number', preview: String(value) }
    case 'boolean':
      return { type: 'boolean', preview: String(value) }
    default:
      return { type: typeof value, preview: String(value) }
  }
}

// Summarizes just the top level of the parsed value into table rows —
// deep-diving into every nested object would turn into its own tree-view
// feature, which isn't needed for a quick "what am I looking at" glance.
export function summarizeTopLevel(parsed) {
  if (Array.isArray(parsed)) {
    const rows = parsed.slice(0, MAX_ROWS).map((value, i) => ({ key: `[${i}]`, ...describeValue(value) }))
    return { kind: 'array', rows, total: parsed.length }
  }
  if (parsed !== null && typeof parsed === 'object') {
    const entries = Object.entries(parsed)
    const rows = entries.slice(0, MAX_ROWS).map(([key, value]) => ({ key, ...describeValue(value) }))
    return { kind: 'object', rows, total: entries.length }
  }
  const { type, preview } = describeValue(parsed)
  return { kind: 'primitive', rows: [{ key: '(root)', type, preview }], total: 1 }
}

// Modern V8 already includes "line X column Y" in JSON.parse's error
// message; older engines only give a character offset ("position N"), so
// that's computed manually as a fallback.
export function parseJsonError(text, message) {
  const lineColMatch = message.match(/line (\d+) column (\d+)/i)
  if (lineColMatch) {
    return { line: Number(lineColMatch[1]), column: Number(lineColMatch[2]) }
  }

  const posMatch = message.match(/position (\d+)/i)
  if (posMatch) {
    const position = Number(posMatch[1])
    const upToError = text.slice(0, position)
    const lines = upToError.split('\n')
    return { line: lines.length, column: lines[lines.length - 1].length + 1 }
  }

  return null
}

// JSON.parse's own wording for a trailing comma ("Expected double-quoted
// property name...") is technically accurate but reads as a non sequitur to
// most people, since the actual mistake is the comma one character earlier.
// This gives that specific, extremely common case a plain-English callout.
export function detectTrailingComma(text) {
  const match = text.match(/,(\s*)([}\]])/)
  if (!match) return null
  return `This looks like a trailing comma before "${match[2]}" — JSON doesn't allow a comma after the last item in an object or array.`
}
