## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-02-02 - Hardcoded Secrets in Maintenance Scripts
**Vulnerability:** A hardcoded Supabase Anon Key was found in `scripts/generate-sitemap.mjs`. While Anon keys are generally public, hardcoding them ties the code to specific instances and encourages bad practices (copy-paste to service keys).
**Learning:** Build and maintenance scripts often fly under the radar during security reviews. They must be treated with the same rigor as application code.
**Prevention:** Strictly enforce environment variable usage in all scripts. Use conditional logic to degrade gracefully (skip non-essential steps) if secrets are missing in the local environment.
