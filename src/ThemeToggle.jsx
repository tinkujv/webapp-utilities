import { useEffect, useState } from 'react'
import './ThemeToggle.css'

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={isDark ? 'theme-toggle is-dark' : 'theme-toggle'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-star theme-toggle-star-1" aria-hidden="true">✦</span>
      <span className="theme-toggle-star theme-toggle-star-2" aria-hidden="true">✧</span>
      <span className="theme-toggle-thumb" aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
