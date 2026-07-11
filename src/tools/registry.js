import CronExplainer from './cron/CronExplainer.jsx'

// Each entry is a self-contained tool: a nav label plus the component that
// renders it. Adding YAML/JSON later means adding a folder under src/tools
// and one line here — nothing else in the app needs to change.
export const tools = [
  {
    id: 'cron',
    name: 'Cron Expression',
    icon: '⏰',
    tagline: 'Paste a cron schedule and see what it actually means',
    Component: CronExplainer,
  },
]
