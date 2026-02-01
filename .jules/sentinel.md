## 2024-05-22 - Accidental Secret Leaks via Vite Define
**Vulnerability:** A server-side API key (`GEMINI_API_KEY`) was being injected into the client-side bundle via `vite.config.ts` using the `define` property. This effectively made the secret public to anyone inspecting the frontend code.
**Learning:** Vite's `define` feature performs static replacement during the build. If you map a `process.env` variable to a value from the build environment, that value is hardcoded into the output JavaScript.
**Prevention:** Never use `define` to inject secrets. Use `import.meta.env` with `VITE_` prefix only for intentionally public variables. For secrets, keep them strictly server-side (e.g., in Supabase Edge Functions) and proxy requests.

## 2024-05-24 - Unnecessary Use of 'eval' (new Function) for Trusted Tools
**Vulnerability:** The application was using `new Function` (effectively `eval`) to execute all AI tool logic, including built-in tools. While this is necessary for user-customized tools, it unnecessarily expanded the attack surface for built-in, trusted tools.
**Learning:** Hardcoding tool logic as strings and re-hydrating them via `new Function` bypasses static analysis and creates risk if the string source is ever compromised.
**Prevention:** Implement a hybrid execution model. Use direct function references for trusted, static tools (Secure Path) and reserve dynamic evaluation only for user-edited code (Dynamic Path). Ensure the secure path is invalidated if the user edits the code.
