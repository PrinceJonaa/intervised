## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-01-30 - Hardcoded Supabase Fallback Credentials
**Vulnerability:** Hardcoded Supabase credentials (`FALLBACK_URL`, `FALLBACK_ANON_KEY`) were present in `lib/supabase/client.ts` and `scripts/generate-sitemap.mjs`, potentially exposing the database to unauthorized access.
**Learning:** Even "public" anonymous keys should not be hardcoded as it bypasses environment configuration and makes key rotation difficult. It also sets a precedent for hardcoding other secrets.
**Prevention:** Strictly enforce environment variable checks at initialization and fail fast (throw error) if critical configuration is missing. Graceful degradation (skipping features) is acceptable for auxiliary scripts.
