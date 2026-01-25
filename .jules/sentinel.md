## 2026-01-25 - Hardcoded Fallback Secrets in Client Code
**Vulnerability:** Found hardcoded Supabase keys and a G4F API key used as "fallbacks" for development. The Supabase fallback keys pointed to a production instance.
**Learning:** Developers often add "fallback" keys to make local development easier (zero-setup), but this exposes production credentials in the codebase. Even "public" keys can be risky if RLS is not perfect.
**Prevention:** Never provide default values for secrets or configuration keys in the code. Force the application to fail fast if environment variables are missing, ensuring developers set up their own environment.
