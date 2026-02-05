## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2024-05-24 - [Toast Accessibility & Visual Feedback]
**Learning:** Standard toast notifications often lack intrinsic accessibility attributes (role, aria-live) and visual duration indicators, making them confusing for screen readers and cognitively demanding for sighted users who must guess when the message disappears.
**Action:** Always couple auto-dismiss logic with a visual timer (progress bar) and strictly map toast types to semantic roles (error -> alert, info -> status) to ensure inclusive communication.

## 2024-05-25 - [Contextual ARIA & Escape Hatches]
**Learning:** Custom dropdowns/overlays often trap keyboard users if they lack 'Close on Escape' logic, and generic ARIA labels (e.g., "Mark as read") in lists make management impossible for screen reader users who can't see the adjacent item context.
**Action:** Always implement a global 'keydown' listener for Escape on overlays, and inject dynamic content (names/titles) into the `aria-label` of repeated actions in a list.
