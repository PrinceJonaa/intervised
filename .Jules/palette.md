# Palette's Journal

## 2024-05-23 - Accessibility in Custom UI
**Learning:** This application relies heavily on custom interactive components (BookingConsole) which often miss standard accessibility attributes like `htmlFor` on labels and `aria-label` on icon-only or context-dependent buttons (like calendar days).
**Action:** When designing or refactoring custom UI components, always audit for screen reader experience by ensuring every interactive element has a programmatic label and state indication (aria-pressed/expanded).

## 2024-05-23 - Build System
**Learning:** The project is missing `@types/react` and `@types/react-dom` in `package.json`, causing `tsc` to fail with JSX errors, even though Vite build succeeds.
**Action:** Rely on `vite build` for verification rather than `tsc` until dependencies are fixed.
