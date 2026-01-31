## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-01-31 - Dynamic Code Execution (Eval) in Tooling
**Vulnerability:** The AI tool executor used `new Function` to execute tool logic from strings, creating a potential RCE vector if tool definitions were tampered with or if the "Edit Tool" feature was misused.
**Learning:** Storing code as strings and hydrating them at runtime via `eval`/`new Function` is inherently risky and redundant when the code is available at build time. It also makes debugging difficult and breaks source maps.
**Prevention:** Prefer direct function references for static tools. Use a hybrid approach where static tools use secure, direct execution (`implementation` field), and dynamic execution is reserved strictly for runtime-defined content with explicit warnings and reduced scope.
