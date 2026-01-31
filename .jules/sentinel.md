## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2026-01-29 - Unsafe Tool Execution via new Function
**Vulnerability:** The application was using `new Function()` to execute tool logic defined as strings. This poses a significant security risk (Arbitrary Code Execution) if the tool definitions were ever tampered with or if user-generated tools were introduced.
**Learning:** Even if code is currently static/local, using `new Function` or `eval` creates a dangerous architectural pattern that is hard to secure later. It bypasses compile-time checks and browser security features (CSP).
**Prevention:** Refactored `executeTool` to prioritize direct function execution using the `implementation` property on `ToolDefinition`. `new Function` is retained only as a fallback for legacy string-based tools but is no longer used for the core built-in tools.
