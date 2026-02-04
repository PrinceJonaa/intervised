## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-23 - Unnecessary Dynamic Code Execution in Tooling
**Vulnerability:** The AI tool execution engine (`lib/toolExecutor.ts`) relied exclusively on `new Function` to execute tool logic, even for static, trusted tools defined in the codebase.
**Learning:** This likely existed to support a unified interface for both static and potentially dynamic (user-created) tools, but it unnecessarily exposed the application to XSS/RCE risks by serializing and deserializing trusted code.
**Prevention:** Implement hybrid execution strategies. Always prefer direct function references (`implementation`) for trusted code, and restrict `new Function`/`eval` only to scenarios where dynamic execution is strictly required (and heavily sandboxed).
