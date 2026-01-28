# Sentinel Journal

## 2025-05-23 - Hardcoded Fallback Secrets
**Vulnerability:** Hardcoded Supabase credentials (URL and Anon Key) were present in `client.ts`, `aiService.ts`, and `generate-sitemap.mjs` as "fallback" values for development.
**Learning:** The project used these fallbacks to ease setup, but this bypasses environment configuration and risks leaking secrets or connecting to the wrong environment. Comments claimed they were "safe/public", leading to their proliferation.
**Prevention:** Strictly enforce environment variable usage. Throw errors if keys are missing rather than using fallbacks. Update `.env.example` to provide necessary values for developers instead of embedding them in code.
