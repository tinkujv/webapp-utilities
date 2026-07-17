# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install       # install dependencies
npm run dev       # start Vite dev server (HMR)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint (rules: .oxlintrc.json)
```

There is no test framework configured in this project.

## Architecture

This is a client-side-only React + Vite SPA (plain JS, no TypeScript) — a suite of small
"paste something in, get it explained" developer utilities (Cron, JSON, JWT, Timestamp,
Tokenizer, URL). There is no backend and no tool ever calls a network API; every parse/
validate/convert operation must run entirely in the browser. Keep it that way — it's the
whole premise of the app (nothing pasted here ever leaves the machine).

### Tool plugin pattern

`src/tools/registry.js` exports a `tools` array — `{ id, name, icon, tagline, Component }` —
and `App.jsx` renders a segmented toggle purely by mapping over that array, mounting whichever
tool's `Component` is active. **To add a new tool**: create `src/tools/<name>/` containing:

- `<Name>Explainer.jsx` — the component
- `<Name>Explainer.css` — its styles, imported directly by the component (plain global
  classes prefixed with a short tool-specific tag, e.g. `cron-`, `json-`, `jwt-`, `ts-`,
  `tok-`, `url-`, to avoid collisions — there's no CSS module scoping)
- `<name>Analysis.js` — pure functions doing the actual parsing/formatting logic, kept
  separate from the component so it stays unit-testable and easy to reason about in
  isolation

Then add one entry to `registry.js`. Nothing else in the app needs to change — this is
the pattern to follow; don't introduce routing or a different state-management approach
for it.

Each tool prefers zero/minimal dependencies and leans on native browser APIs where
possible (`JSON.parse`, `URL`/`URLSearchParams`, `Date`, hand-rolled base64url decode for
JWT). Where a real dependency is justified, it's because the underlying logic is
genuinely nontrivial to reimplement correctly (`cron-parser` + `cronstrue` for cron
expressions, `gpt-tokenizer` for BPE tokenization). The tokenizer tool is explicitly
scoped to OpenAI's tokenizer only (cl100k_base / o200k_base) — there is no offline
tokenizer for Claude, so don't present token counts here as if they apply universally.

### Theming

All color/surface values are CSS custom properties defined once on `:root` in
`src/index.css`, with a full dark-mode override block under `:root[data-theme='dark']`.
`ThemeToggle.jsx` flips themes by setting `document.documentElement.dataset.theme` and
persists the choice to `localStorage` (defaulting to `prefers-color-scheme` on first
visit). New components should use the existing variables (`--text`, `--text-h`, `--bg`,
`--border`, `--code-bg`, `--accent`, `--accent-bg`, `--accent-border`, `--error`,
`--error-bg`, `--error-border`, `--shadow`, `--page-gradient`) rather than hardcoded
colors so they theme automatically. If a tool needs its own palette (see the tokenizer's
`--tok-1`..`--tok-8` chip colors), define those as root variables too — not local hex
values in the tool's CSS — so the dark-mode block can override them centrally.

### Deployment

GitHub Pages via `.github/workflows/deploy.yml`, building and deploying `dist/` on every
push to `main`. `vite.config.js` sets `base: '/webapp-utilities/'` because project pages
serve from that subpath, not the domain root — if the repo is ever renamed or forked,
that base path must be updated to match or built asset URLs will 404.
