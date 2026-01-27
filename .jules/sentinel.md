## 2024-02-18 - Hardcoded API Key in Service Layer
**Vulnerability:** Found a hardcoded G4F API key exported as a constant in `lib/g4fService.ts` and used as a fallback.
**Learning:** Developers sometimes hardcode "default" keys for convenience in development, but these can easily leak into production if not stripped or managed via environment variables. The "fallback" pattern encourages this bad practice.
**Prevention:** Strictly enforce environment variable usage for all secrets. Reject PRs that contain "fallback" keys even if labeled as "default" or "dev only".
