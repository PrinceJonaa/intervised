## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2024-05-24 - [Toast Accessibility & Visual Feedback]
**Learning:** Standard toast notifications often lack intrinsic accessibility attributes (role, aria-live) and visual duration indicators, making them confusing for screen readers and cognitively demanding for sighted users who must guess when the message disappears.
**Action:** Always couple auto-dismiss logic with a visual timer (progress bar) and strictly map toast types to semantic roles (error -> alert, info -> status) to ensure inclusive communication.

## 2025-02-20 - [Form Input Association & Grouping]
**Learning:** Custom input wrappers often break accessibility because they visually group a label and input without programmatically linking them via `id` and `htmlFor`, and button-based selection groups often lack semantic context for screen readers.
**Action:** Use `React.useId()` in custom input components to automatically generate unique IDs for `htmlFor` association, and wrap button-based selection sets in a container with `role="group"` and `aria-label`, ensuring selected buttons use `aria-pressed`.
