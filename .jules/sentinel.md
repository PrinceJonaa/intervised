## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-23 - Arbitrary Code Execution via Internal Tool Serialization
**Vulnerability:** The application was serializing internal tool functions into strings and executing them using `new Function()`. This pattern created an unnecessary RCE risk by relying on dynamic code execution for trusted, static code.
**Learning:** Even internal tools shouldn't be executed via `eval`-like mechanisms. It bypasses compile-time checks, breaks source maps, and normalizes a dangerous pattern that might later be exposed to user input.
**Prevention:** Use direct function references for internal logic. Only use `new Function` or sandboxed environments for truly dynamic, user-provided code, and always strictly isolate it.
