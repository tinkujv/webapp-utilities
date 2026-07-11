// JWTs are just three base64url segments joined by dots — header.payload.signature.
// Decoding needs no library, only base64url's two quirks versus plain base64:
// '-'/'_' instead of '+'/'/', and stripped padding.

function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const percentEncoded = Array.from(binary, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
  return decodeURIComponent(percentEncoded)
}

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Builds a throwaway (unsigned) sample token purely for the preset buttons —
// the signature is never verified by this tool, so it doesn't need to be real.
export function buildSampleJwt(header, payload, signature = 'unverified-sample-signature') {
  return [base64UrlEncode(header), base64UrlEncode(payload), signature].join('.')
}

export function parseJwt(token) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return {
      valid: false,
      error: `A JWT has 3 dot-separated parts (header.payload.signature) — this has ${parts.length}.`,
    }
  }

  const [headerPart, payloadPart, signature] = parts
  let header
  let payload
  try {
    header = JSON.parse(base64UrlDecode(headerPart))
  } catch (err) {
    return { valid: false, error: `Couldn't decode the header: ${err.message}` }
  }
  try {
    payload = JSON.parse(base64UrlDecode(payloadPart))
  } catch (err) {
    return { valid: false, error: `Couldn't decode the payload: ${err.message}` }
  }

  return { valid: true, header, payload, signature }
}

// RFC 7519 §4.1 registered claim names — everything else in the payload is
// application-specific and gets shown as-is rather than mislabeled.
const CLAIM_LABELS = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration time',
  nbf: 'Not valid before',
  iat: 'Issued at',
  jti: 'Token ID',
}

const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat'])

export function describeClaim(key, value) {
  const label = CLAIM_LABELS[key] ?? key
  if (TIME_CLAIMS.has(key) && typeof value === 'number') {
    return { label, preview: new Date(value * 1000).toLocaleString() }
  }
  if (Array.isArray(value)) return { label, preview: value.join(', ') }
  if (value !== null && typeof value === 'object') return { label, preview: JSON.stringify(value) }
  return { label, preview: String(value) }
}

function formatDuration(totalSeconds) {
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  for (const [name, secs] of units) {
    if (totalSeconds >= secs) {
      const count = Math.floor(totalSeconds / secs)
      return `${count} ${name}${count === 1 ? '' : 's'}`
    }
  }
  return 'less than a second'
}

export function getExpiryStatus(payload) {
  if (typeof payload.exp !== 'number') {
    return { state: 'none', message: "No expiration claim (exp) — this token doesn't expire on its own." }
  }
  const now = Math.floor(Date.now() / 1000)
  const diff = payload.exp - now
  const at = new Date(payload.exp * 1000).toLocaleString()
  if (diff <= 0) {
    return { state: 'expired', message: `Expired ${formatDuration(-diff)} ago (at ${at}).` }
  }
  return { state: 'active', message: `Expires in ${formatDuration(diff)} (at ${at}).` }
}
