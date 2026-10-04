## 2026-10-04 - ARIA Label Recognition on Generic Div Elements
**Learning:** Screen readers often ignore `aria-label` attributes on generic `<div>` containers unless an explicit role (such as `role="img"`) is provided.
**Action:** Always include an appropriate ARIA role (e.g. `role="img"`) when adding `aria-label` descriptions to custom visual widgets rendered with generic `div`s.
