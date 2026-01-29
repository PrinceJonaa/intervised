## 2024-05-22 - [Hold to Action Accessibility]
**Learning:** The 'Hold to Action' interaction pattern, while visually engaging for 'console-like' UIs, is often implemented solely with mouse events, excluding keyboard users entirely.
**Action:** When using hold interactions, always map Space/Enter keys to the start/end events using onKeyDown (with repeat check) and onKeyUp to ensure full keyboard parity.

## 2026-01-29 - [Timed Alert Visibility]
**Learning:** Temporary alerts often vanish before users finish reading them, and lack of visual timing indicators creates anxiety or missed information.
**Action:** Always provide a visual progress bar for auto-dismissing alerts and ensure the duration is sufficient (5s+), while mapping appropriate ARIA roles ('alert'/'status') so screen readers catch them immediately.
