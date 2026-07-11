// The native URL/URLSearchParams objects already do all the real parsing —
// this just reshapes their output into label/value rows for display.

export function parseUrl(raw) {
  const trimmed = raw.trim()
  if (trimmed === '') return { valid: false, error: 'Enter a URL.' }

  try {
    return { valid: true, url: new URL(trimmed), assumedProtocol: false }
  } catch {
    // The single most common reason a URL fails to parse is a missing
    // protocol (e.g. "example.com/path"), so that's worth a silent retry
    // rather than surfacing a raw error for the most ordinary input.
  }

  try {
    return { valid: true, url: new URL(`https://${trimmed}`), assumedProtocol: true }
  } catch (err) {
    return { valid: false, error: err.message }
  }
}

export function getUrlParts(url) {
  const parts = [
    { label: 'Protocol', value: url.protocol },
    { label: 'Host', value: url.hostname },
  ]
  if (url.port) parts.push({ label: 'Port', value: url.port })
  parts.push({ label: 'Path', value: url.pathname || '/' })
  if (url.search) parts.push({ label: 'Query string', value: url.search })
  if (url.hash) parts.push({ label: 'Fragment', value: url.hash })
  if (url.username) parts.push({ label: 'Username', value: url.username })
  if (url.password) parts.push({ label: 'Password', value: url.password })
  parts.push({ label: 'Origin', value: url.origin })
  return parts
}

export function getQueryParams(url) {
  return Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value }))
}
