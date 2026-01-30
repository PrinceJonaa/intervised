## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2024-05-24 - [Accessible Form Inputs]
**Learning:** Custom input components often neglect programmatic association between labels and inputs (missing `htmlFor`/`id`), rendering them invisible to screen readers despite visual proximity.
**Action:** Use `React.useId()` within custom input components to automatically generate unique IDs and link labels to inputs, ensuring accessibility without manual ID management.
