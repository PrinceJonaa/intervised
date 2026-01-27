## 2026-01-27 - Accessibility Pattern: useId for Forms
**Learning:** React's `useId` hook is the cleanest way to associate labels with inputs in this component-based architecture, especially when inputs are wrapped in custom components or reused. This avoids ID collisions and ensures screen reader support.
**Action:** When refactoring existing form inputs or creating new ones, always use `useId` to generate unique IDs for `htmlFor` and `id` attributes instead of hardcoded strings or relying on implicit association.
