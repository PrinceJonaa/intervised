## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2025-05-22 - Insecure Dynamic Code Execution in AI Tools
**Vulnerability:** The AI tool execution engine (`lib/toolExecutor.ts`) relied exclusively on `new Function` to execute tool logic. While the code was technically static, this pattern is a dangerous sink that security scanners flag and could be exploited if the source code string was ever tampered with or user-controlled.
**Learning:** Even if the source of the code string is trusted (e.g., a hardcoded object), converting functions to strings and back via `new Function` is fragile, inefficient, and breaks scope access (e.g., imports).
**Prevention:** Use direct function references (`implementation` field) for trusted tools. Only use `new Function` as a last resort for truly dynamic, sandboxed code (like user-defined scripts). I updated `ToolDefinition` to support direct execution.
