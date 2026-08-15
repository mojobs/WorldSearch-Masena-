# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Security notes (frontend-only constraints)

This is a client-only SPA with no backend, which puts two things out of reach of a pure code fix:

- **The countries API key (`VITE_COUNTRIES_API_KEY`) is visible in the shipped bundle.** Any `VITE_`-prefixed env var gets inlined into the client JS at build time, so it's readable by anyone who opens devtools. There's no way to keep an API key secret without a server to hold it — the only real fix is a backend proxy that calls the countries API on the client's behalf.
- **The "admin" role check is a client-side convenience, not real authentication.** `login()` in [`src/services/authSession/authSession.ts`](src/services/authSession/authSession.ts) compares against `VITE_ADMIN_USERNAME`/`VITE_ADMIN_PASSWORD`, which are also inlined into the bundle, and the resulting role is trusted straight out of `sessionStorage`. Anyone with devtools can set that value directly (`sessionStorage.setItem('world-search:auth-session', '{"role":"admin","name":"x"}')`) and reach the admin page without ever knowing the password. Fixing this for real requires a server that verifies credentials and issues a session/token the client can't forge.

Everything else flagged in review has been mitigated in code: `.env` is gitignored (see `.env.example` for the required shape), a CSP is set in `index.html`, flag image URLs are validated to `https:` before being used as an `<img src>`, and the lookup log in `localStorage` now prunes entries older than 30 days and can be cleared from the admin page.

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
