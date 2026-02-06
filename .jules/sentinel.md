## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-23 - Insecure Tool Execution via new Function
**Vulnerability:** The AI tool execution logic relied on `new Function` to execute all tools, including internal static ones. This is a security risk (potential code injection sink) and caused scope isolation issues where tools couldn't access imported modules.
**Learning:** While `new Function` can be used for dynamic code, it shouldn't be the default for static code. It strips closure access to the module scope, breaking imports and requiring manual dependency injection.
**Prevention:** Always prefer direct function references (first-class functions) for internal logic. Only use dynamic execution methods for user-generated code, and even then, use a proper sandbox if possible.
