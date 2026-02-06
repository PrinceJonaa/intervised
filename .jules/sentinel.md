## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2025-02-23 - Unsafe Execution of Built-in Tools via new Function
**Vulnerability:** Built-in tools defined in `lib/aiTools.ts` were having their source code extracted to strings and executed via `new Function` in `lib/toolExecutor.ts`, effectively treating trusted code as untrusted/dynamic input.
**Learning:** This architecture bypassed the safety of the compiled module scope (imports/closures) and relied on manual dependency injection.
**Prevention:** Always prefer direct function references (`implementation` field) for trusted code. Use `new Function` only as a last resort for truly dynamic, user-generated code.
