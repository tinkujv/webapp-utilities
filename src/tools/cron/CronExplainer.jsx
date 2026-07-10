import { useMemo, useState } from 'react'
import cronstrue from 'cronstrue'
import { CronExpressionParser } from 'cron-parser'
import { FIELD_KEYS_BY_LENGTH, FIELD_META, describeField } from './cronFields.js'
import './CronExplainer.css'

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every weekday at 9am', value: '0 9 * * 1-5' },
  { label: 'First day of the month', value: '0 0 1 * *' },
]

export default function CronExplainer() {
  const [expression, setExpression] = useState(PRESETS[1].value)

  const fields = useMemo(() => expression.trim().split(/\s+/).filter(Boolean), [expression])
  const fieldKeys = FIELD_KEYS_BY_LENGTH[fields.length]

  // cron-parser actually validates field ranges (e.g. minute 0-59), while
  // cronstrue is lenient and will happily describe an out-of-range value.
  // So cron-parser decides whether the expression is valid at all, and
  // cronstrue is only asked for a sentence once that check has passed.
  const parsed = useMemo(() => {
    try {
      const interval = CronExpressionParser.parse(expression)
      let explanation
      try {
        explanation = cronstrue.toString(expression, { verbose: true })
      } catch {
        explanation = null
      }
      return { valid: true, explanation, nextRuns: interval.take(5).map((d) => d.toDate()) }
    } catch (err) {
      return { valid: false, error: err.message }
    }
  }, [expression])

  return (
    <div className="cron-explainer">
      <label className="cron-input-label" htmlFor="cron-input">
        Cron expression
      </label>
      <input
        id="cron-input"
        className="cron-input"
        type="text"
        spellCheck={false}
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
      />

      <div className="cron-presets">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className="cron-preset-button"
            onClick={() => setExpression(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {!parsed.valid ? (
        <div className="cron-error">Can't parse this expression: {parsed.error}</div>
      ) : (
        <div className="cron-explanation">
          {parsed.explanation ?? 'Valid schedule, but no plain-English description is available for it.'}
        </div>
      )}

      {parsed.valid && fieldKeys && (
        <table className="cron-breakdown">
          <thead>
            <tr>
              {fieldKeys.map((key) => (
                <th key={key}>{FIELD_META[key].label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {fields.map((value, i) => (
                <td key={i}><code>{value}</code></td>
              ))}
            </tr>
            <tr className="cron-breakdown-meaning">
              {fields.map((value, i) => (
                <td key={i}>{describeField(value, fieldKeys[i])}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {parsed.valid && (
        <div className="cron-next-runs">
          <h3>Next 5 runs</h3>
          <ol>
            {parsed.nextRuns.map((date, i) => (
              <li key={i}>{date.toLocaleString()}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
