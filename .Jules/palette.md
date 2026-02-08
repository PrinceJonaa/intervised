## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2024-05-24 - [Toast Accessibility & Visual Feedback]
**Learning:** Standard toast notifications often lack intrinsic accessibility attributes (role, aria-live) and visual duration indicators, making them confusing for screen readers and cognitively demanding for sighted users who must guess when the message disappears.
**Action:** Always couple auto-dismiss logic with a visual timer (progress bar) and strictly map toast types to semantic roles (error -> alert, info -> status) to ensure inclusive communication.

## 2024-05-25 - [Dropdown Accessibility & Escape Key]
**Learning:** Custom dropdowns often rely solely on "click outside" for dismissal, trapping keyboard users who cannot easily "click outside" and expect the Escape key to close the overlay.
**Action:** Always pair "click outside" logic with a global `keydown` listener for the Escape key, and ensure the trigger button has `aria-expanded` and `aria-controls` linked to the dropdown's ID.
