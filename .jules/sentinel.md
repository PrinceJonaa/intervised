## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-24 - Unnecessary Eval of Trusted Code
**Vulnerability:** The application was using `new Function` to execute all AI tool logic, including trusted, built-in tools. This exposed the application to Remote Code Execution (RCE) risks if the tool definition strings were tampered with, and violated CSP principles.
**Learning:** Features that require dynamic execution (like user-defined scripts) often inadvertently drag trusted code into the same insecure execution path. "Uniformity" in execution logic can be a security weakness.
**Prevention:** Implement a "Fast Path" or "Secure Path" for trusted code using direct function references (registry pattern). Isolate the insecure `eval/new Function` path strictly for user-defined content and flag it explicitly (e.g., `isCustom: true`).
