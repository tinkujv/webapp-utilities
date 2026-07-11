import CronExplainer from './cron/CronExplainer.jsx'
import JsonExplainer from './json/JsonExplainer.jsx'
import JwtExplainer from './jwt/JwtExplainer.jsx'
import TimestampExplainer from './timestamp/TimestampExplainer.jsx'
import TokenizerExplainer from './tokenizer/TokenizerExplainer.jsx'
import UrlExplainer from './url/UrlExplainer.jsx'

// Each entry is a self-contained tool: a nav label plus the component that
// renders it. Adding YAML later means adding a folder under src/tools and
// one line here — nothing else in the app needs to change.
export const tools = [
  {
    id: 'cron',
    name: 'Cron',
    icon: '⏰',
    tagline: 'Paste a cron schedule and see what it actually means',
    Component: CronExplainer,
  },
  {
    id: 'json',
    name: 'JSON',
    icon: '{}',
    tagline: 'Validate, format, and get a quick read on any JSON payload',
    Component: JsonExplainer,
  },
  {
    id: 'jwt',
    name: 'JWT',
    icon: '🔑',
    tagline: 'Decode a token and see what it claims and when it expires',
    Component: JwtExplainer,
  },
  {
    id: 'timestamp',
    name: 'Timestamp',
    icon: '🕒',
    tagline: 'Convert Unix timestamps and dates, either direction',
    Component: TimestampExplainer,
  },
  {
    id: 'tokenizer',
    name: 'Tokenizer',
    icon: '🧩',
    tagline: 'See how AI models actually split your text into tokens',
    Component: TokenizerExplainer,
  },
  {
    id: 'url',
    name: 'URL',
    icon: '🔗',
    tagline: 'Break a URL into its parts and encode or decode text',
    Component: UrlExplainer,
  },
]
