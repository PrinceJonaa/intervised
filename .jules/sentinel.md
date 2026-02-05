## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2025-05-23 - Unsafe Dynamic Code Execution in Tooling
**Vulnerability:** The `lib/toolExecutor.ts` module relied exclusively on `new Function` to execute AI tool logic, effectively using `eval` on code strings for all tools, including built-ins.
**Learning:** While dynamic execution is necessary for user-defined scripts, using it for static, trusted code introduces unnecessary RCE risk and breaks context/closure access (requiring manual dependency injection).
**Prevention:** Implement a "Secure Path" by carrying the actual function reference (`implementation`) in the `ToolDefinition`. Always check for and use the direct function reference before falling back to dynamic string execution.
