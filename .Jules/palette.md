## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2024-05-23 - [Visual Timing Indicators]
**Learning:** Auto-dismissing alerts (Toasts) create anxiety for users with cognitive or reading difficulties if the timeout is invisible.
**Action:** Always include a visual progress bar synchronized with the timeout duration. Ensure the duration is at least 5000ms and use `role="alert"` (error) or `role="status"` (info) for screen readers.
