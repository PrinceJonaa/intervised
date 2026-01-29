## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-23 - Unnecessary Use of Eval for Internal Tools
**Vulnerability:** The `executeTool` function used `new Function` to execute internal tool logic by reconstructing function bodies from strings. This created an unnecessary Remote Code Execution (RCE) sink.
**Learning:** Serializing function bodies to strings and re-evaluating them is brittle (breaks with closures/minification) and insecure.
**Prevention:** Pass direct function references (`implementation` field) for static/built-in tools. Reserve `eval`/`new Function` strictly for sandboxed user-generated code (if absolutely necessary and properly isolated).
