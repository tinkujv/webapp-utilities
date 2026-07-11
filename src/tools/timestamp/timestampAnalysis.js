// Converts between Unix timestamps and human dates using only the native
// Date object — no dependency needed for either direction.

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.floor((date - start) / 86400000) + 1
}

function formatRelative(date) {
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(diffSeconds)
  if (abs < 1) return 'right now'

  const units = [
    ['year', 31536000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]

  for (const [name, secs] of units) {
    const count = Math.floor(abs / secs)
    if (count >= 1) {
      const label = `${count} ${name}${count === 1 ? '' : 's'}`
      return diffSeconds >= 0 ? `in ${label}` : `${label} ago`
    }
  }
  return 'right now'
}

// A bare number is ambiguous between seconds and milliseconds. Unix seconds
// for any date between 1970 and ~5138 stay under 1e11, while the equivalent
// millisecond value is always 1000x larger — so a simple magnitude check
// disambiguates the two conventions correctly for any realistic date.
export function parseTimestampInput(raw) {
  const trimmed = raw.trim()
  if (trimmed === '') return { valid: false, error: 'Enter a timestamp or date.' }

  if (/^-?\d+$/.test(trimmed)) {
    const num = Number(trimmed)
    const detectedAs = Math.abs(num) < 1e11 ? 'seconds' : 'milliseconds'
    const date = new Date(detectedAs === 'seconds' ? num * 1000 : num)
    if (Number.isNaN(date.getTime())) {
      return { valid: false, error: 'That number is out of range for a valid date.' }
    }
    return { valid: true, date, detectedAs }
  }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,
      error: "Couldn't parse that as a date. Try an ISO format like 2026-01-01 or a Unix timestamp.",
    }
  }
  return { valid: true, date, detectedAs: 'date string' }
}

export function describeDate(date) {
  const rows = [
    { label: 'Unix (seconds)', value: String(Math.floor(date.getTime() / 1000)) },
    { label: 'Unix (milliseconds)', value: String(date.getTime()) },
    { label: 'ISO 8601', value: date.toISOString() },
    { label: 'UTC', value: date.toUTCString() },
    { label: 'Local', value: date.toLocaleString() },
    { label: 'Weekday', value: WEEKDAYS[date.getDay()] },
    { label: 'Day of year', value: String(dayOfYear(date)) },
  ]
  return { rows, relative: formatRelative(date) }
}
