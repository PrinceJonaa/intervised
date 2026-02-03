## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-02-03 - Unnecessary Dynamic Code Execution
**Vulnerability:** Trusted internal tools were being executed via `new Function` after string serialization, creating an unnecessary RCE risk surface and relying on fragile scope injection.
**Learning:** Even trusted code shouldn't be run through `eval`-like constructs if a direct reference is available. Security mechanisms often need to be hybrid: supporting secure static paths while maintaining flexibility for dynamic features only where strictly necessary.
**Prevention:** Always prefer passing function references over code strings. Design plugin systems to accept implementation objects first, falling back to sandboxed execution only for truly dynamic user-provided code.
