# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Backend (`server/`)

The frontend used to record IP lookups straight into `localStorage`, which meant the admin page could only ever see lookups made from the same browser/device it was opened on. `server/` is a small Express API that centralizes this: every device POSTs lookups to it, and the admin page reads the same shared log back from it, regardless of which device is used.

- `POST /api/lookups` — records a lookup. The server determines the caller's IP from the request itself (`X-Forwarded-For`/socket address) rather than trusting a client-reported IP, then resolves it to a country/city via the [REST Countries IP API](https://restcountries.com/apis/ip) (`api.restcountries.com/ip/v1/{address}`).
- `GET /api/lookups` — returns all recorded lookups, newest first.
- `DELETE /api/lookups` — clears the log.

Data is persisted to `server/data/lookups.json` (gitignored), pruned the same way the old localStorage log was (max 500 entries, 30-day retention).

To run it locally:

```
cd server
cp .env.example .env   # fill in COUNTRIES_API_KEY
npm install
npm run dev
```

The frontend talks to it via `VITE_API_BASE_URL` (see `.env.example` at the repo root).

## Security notes (frontend-only constraints)

Two things remain out of reach of a pure code fix, since the frontend is still a client bundle even with a backend behind it:

- **The countries API key (`VITE_COUNTRIES_API_KEY`) is visible in the shipped bundle.** Any `VITE_`-prefixed env var gets inlined into the client JS at build time, so it's readable by anyone who opens devtools. The IP lookup's API key was moved server-side (`COUNTRIES_API_KEY` in `server/.env`, never `VITE_`-prefixed) as part of adding the backend above, but the countries-search API key is still called directly from the client. The real fix is the same shape: proxy those calls through `server/` too.
- **The "admin" role check is a client-side convenience, not real authentication.** `login()` in [`src/services/authSession/authSession.ts`](src/services/authSession/authSession.ts) compares against `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD`, which are also inlined into the bundle, and the resulting role is trusted straight out of `sessionStorage`. Anyone with devtools can set that value directly (`sessionStorage.setItem('world-search:auth-session', '{"role":"admin","name":"x"}')`) and reach the admin page without ever knowing the password. Because of this, `GET /api/lookups` and `DELETE /api/lookups` are currently **not** authenticated server-side either — fixing this for real requires the server to verify credentials and issue a session/token the client can't forge, then gate those routes on it.

Everything else flagged in review has been mitigated in code: `.env` is gitignored (see `.env.example` for the required shape), a CSP is set in `index.html`, and flag image URLs are validated to `https:` before being used as an `<img src>`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
