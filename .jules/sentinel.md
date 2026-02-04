## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-22 - Dynamic Tool Execution Scope Isolation
**Vulnerability:** Tools were being executed via `new Function`, which creates a fresh scope. This caused tools relying on module-level constants (like `TEAM_DATA`) to fail because those variables were not injected into the execution context. It also presented a risk of Arbitrary Code Execution if tool definitions were compromised.
**Learning:** `new Function` does not share the closure scope of the defining module. Dependencies must be explicitly injected or the original function reference must be used.
**Prevention:** Avoid `new Function` for known, static tools. Store the function reference (`implementation`) in the tool definition and execute it directly to preserve closure access and improve security.
