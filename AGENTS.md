# AI Agent Directives & Protocol

**Welcome, Agent.**
This file is your primary directive source for working on the Intervised repository. It is designed to ensure that multiple agents (or human-agent hybrids) can work asynchronously on this codebase without causing regressions, merge conflicts, or architectural drift.

**Repository Context:**
Intervised is a production-grade React/Vite web application using Supabase for backend services and multiple AI providers (G4F, Gemini, etc.) for its chat features. It is built by a small team with a focus on clean, transparent code.

---

## 1. Operational Directives (Read First)

### A. Async & Conflict Avoidance
-   **State Isolation:** Always assume another agent might be working on a different feature. Do not touch files unrelated to your specific task.
-   **Atomic Changes:** Make small, self-contained changes. If a task requires modifying `lib/`, `hooks/`, and `components/`, treat them as a cohesive unit but do not bundle unrelated refactors.
-   **Branching:** If you have the capability to check branches, ensure you are on a feature-specific branch, not `main`.

### B. Verification Protocol (Mandatory)
Before submitting *any* change, you must perform the following:
1.  **Static Analysis:** Run `npm run build` to verify type safety and build integrity.
2.  **Test Execution:** Run relevant tests (e.g., `npx tsx tests/your_test.ts`). If no test exists for your complex logic, **create one**.
3.  **Visual Verification:** If touching UI (`components/`, `features/`), creating a screenshot via Playwright is **required**. Use the `frontend_verification_instructions` tool if available to you.

### C. Context Preservation
-   **Do Not Delete Comments:** Unless they are obsolete code. Comments often contain intent (e.g., "Theology + Technology").
-   **Read Before Write:** Always read the file you are about to modify. Do not rely solely on your training data; the codebase state is the ground truth.

---

## 2. Architecture & File Structure

This project follows a feature-based organization combined with shared layers.

```
src/
├── features/          # Feature-specific logic & UI (e.g., Chat, Blog, Admin)
│   ├── Chat.tsx       # Main Chat view
│   └── chat/          # Chat sub-components (Sidebar, Settings, etc.)
├── components/        # Shared UI components (Buttons, Layouts, etc.)
├── hooks/             # React Custom Hooks (State & Business Logic)
│   ├── useGeminiAI.ts # CORE: Handles AI chat state, fallback logic, and provider switching.
│   └── ...
├── lib/               # Pure functions, API clients, and services
│   ├── g4fService.ts  # CORE: G4F integration. Complex stream parsing lives here.
│   ├── supabase/      # Supabase clients
│   └── ...
└── types/             # TypeScript definitions
```

**Key Files to Handle with Care:**
-   `lib/g4fService.ts`: Contains custom stream parsing logic for G4F. **Do not refactor the streaming loop without verifying against the `data: {...}data: {...}` edge case.**
-   `hooks/useGeminiAI.ts`: Manages the delicate state of the AI chat (streaming vs. complete, fallbacks). Respect the `hasReceivedChunks` flag logic.

---

## 3. Tech Stack Specifics

-   **Framework:** React 18+ (Vite)
-   **Language:** TypeScript (Strict mode)
-   **Styling:** Tailwind CSS (Utility-first). Use `framer-motion` for animations.
-   **Backend:** Supabase (Auth, DB, Realtime).
-   **AI Integration:**
    -   **G4F (GPT4Free):** Primary free tier provider.
    -   **Google Gemini:** Official API integration.
    -   **Supabase Edge Functions:** For some backend logic (if applicable).

---

## 4. Coding Standards

-   **Components:** Functional components with typed props.
-   **State:** Use `useState` for local UI state, Context for global app state (Auth).
-   **Async:** Async/await preferred over `.then()`.
-   **Error Handling:** UI should never crash. Use Error Boundaries or try/catch blocks in event handlers. Show user-friendly error toasts/messages (like in `Chat.tsx`).

---

## 5. Known Edge Cases (Do Not Break)

1.  **G4F Streaming:**
    -   Providers often send non-standard SSE (Server-Sent Events).
    -   Concatenated JSON chunks (`data: {}data: {}`) are handled in `lib/g4fService.ts`.
    -   `[DONE]` messages must be handled explicitly.

2.  **Chat UI State:**
    -   The "Thinking..." indicator must disappear *immediately* upon receiving the first text chunk.
    -   This is controlled by checking `(!aiDisplayMessage)` in `components/AIPanelContent.tsx`.

---

**End of Directives.**
*Proceed with your task, Agent.*
