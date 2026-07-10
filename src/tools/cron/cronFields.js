// Maps a raw cron field (like "*/15" or "1-5") to a plain-English fragment.
// This is hand-rolled rather than pulled from a library because it only needs
// to describe *one field in isolation* — cronstrue already produces the
// full-sentence explanation; this powers the per-field breakdown table.

export const FIELD_KEYS_BY_LENGTH = {
  5: ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
  6: ['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'],
}

export const FIELD_META = {
  second: { label: 'Second', unit: 'second' },
  minute: { label: 'Minute', unit: 'minute' },
  hour: { label: 'Hour', unit: 'hour' },
  dayOfMonth: { label: 'Day of month', unit: 'day' },
  month: { label: 'Month', unit: 'month' },
  dayOfWeek: { label: 'Day of week', unit: 'weekday' },
}

function describeStep(base, step, unit) {
  if (base === '*') return `every ${step} ${unit}s`
  if (base.includes('-')) {
    const [start, end] = base.split('-')
    return `every ${step} ${unit}s, between ${start} and ${end}`
  }
  return `every ${step} ${unit}s, starting at ${base}`
}

export function describeField(rawValue, fieldKey) {
  const meta = FIELD_META[fieldKey]
  const value = rawValue.trim()

  if (value === '*' || value === '?') return `every ${meta.unit}`

  if (value.includes(',')) {
    return value
      .split(',')
      .map((part) => describeField(part, fieldKey))
      .join('; ')
  }

  if (value.includes('/')) {
    const [base, step] = value.split('/')
    return describeStep(base, step, meta.unit)
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-')
    return `between ${start} and ${end}`
  }

  return `at ${value}`
}
