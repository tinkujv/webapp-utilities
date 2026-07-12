import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project pages are served from https://<user>.github.io/<repo>/, not the
// domain root, so asset URLs need the repo name as a base path — otherwise
// the built index.html references /assets/... which 404s under the subpath.
export default defineConfig({
  plugins: [react()],
  base: '/webapp-utilities/',
})
