## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2025-05-23 - Dynamic Code Execution in Tooling
**Vulnerability:** `lib/toolExecutor.ts` used `new Function` to execute built-in tools by stringifying their bodies. This is insecure (eval-like) and broke access to module-level imports (like `TEAM_DATA`).
**Learning:** Avoid serializing functions to strings for execution. It destroys closure scope and requires dangerous evaluation.
**Prevention:** Use direct function references in `ToolDefinition` (added `implementation` field) to execute trusted code securely and preserve scope access. Retain `new Function` only as a fallback for user-defined (sandboxed) scripts if absolutely necessary.
