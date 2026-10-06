## 2026-03-31 - Search dismiss keyboard accessibility and decorative icon ARIA hiding
**Learning:** Search overlays and inputs in single-page dashboard headers require explicit `Escape` key handling to dismiss search results and blur input focus, alongside ARIA autocomplete attributes (`aria-expanded`, `aria-autocomplete="list"`) for screen readers. In addition, decorative Lucide icons inside interactive action buttons require `aria-hidden="true"` to prevent screen reader clutter.
**Action:** Always ensure search input component overlays handle `Escape` key events and carry proper ARIA combo-box attributes, and mark decorative SVG icons as `aria-hidden="true"`.

## 2026-10-04 - ARIA Label Recognition on Generic Div Elements
**Learning:** Screen readers often ignore `aria-label` attributes on generic `<div>` containers unless an explicit role (such as `role="img"`) is provided.
**Action:** Always include an appropriate ARIA role (e.g. `role="img"`) when adding `aria-label` descriptions to custom visual widgets rendered with generic `div`s.

## 2026-10-18 - Range Slider ARIA Formatting and Button Thumbnail ARIA Hiding
**Learning:** Interactive range sliders (such as scenario form adjustments) require explicit `aria-label` specifying the entity being adjusted and `aria-valuetext` formatted with units (e.g. `+10%`) so screen readers announce human-readable adjustment values rather than raw integers. Additionally, thumbnail images inside interactive buttons with accompanying text labels should use `alt=""` and `aria-hidden="true"` to prevent duplicate title speech.
**Action:** Always provide entity-specific `aria-label` and formatted `aria-valuetext` on range `<input>` controls, and mark thumbnail `<img>` elements inside labeled buttons as decorative.
