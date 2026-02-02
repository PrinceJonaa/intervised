## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-02-02 - Hybrid Tool Execution Strategy
**Vulnerability:** Relying solely on `new Function` (eval) for executing tools exposes the application to XSS risks if the code string is tampered with or if tools are loaded from untrusted sources.
**Learning:** Static, trusted tools should use direct function references, while dynamic execution should be reserved only for user-edited or custom tools.
**Prevention:** Implement a hybrid execution strategy where `ToolDefinition` carries an optional `implementation` function. The executor checks this first before falling back to `new Function`.
