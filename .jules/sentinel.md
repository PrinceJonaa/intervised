## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-22 - Insecure Tool Execution via new Function
**Vulnerability:** The AI tool execution engine used `new Function` to run internal tools, which is a potential security risk (code injection, CSP bypass) and caused issues with scope isolation for imported modules.
**Learning:** Even if code strings come from a trusted source (static files), using `new Function` is an unnecessary risk when the function reference is available. It also complicates dependency injection.
**Prevention:** Populate an `implementation` field with the direct function reference in `ToolDefinition` and prioritize executing it directly. Only fall back to `new Function` for truly dynamic/user-defined code.
