## 2026-03-31 - Search dismiss keyboard accessibility and decorative icon ARIA hiding
**Learning:** Search overlays and inputs in single-page dashboard headers require explicit `Escape` key handling to dismiss search results and blur input focus, alongside ARIA autocomplete attributes (`aria-expanded`, `aria-autocomplete="list"`) for screen readers. In addition, decorative Lucide icons inside interactive action buttons require `aria-hidden="true"` to prevent screen reader clutter.
**Action:** Always ensure search input component overlays handle `Escape` key events and carry proper ARIA combo-box attributes, and mark decorative SVG icons as `aria-hidden="true"`.

## 2026-10-04 - ARIA Label Recognition on Generic Div Elements
**Learning:** Screen readers often ignore `aria-label` attributes on generic `<div>` containers unless an explicit role (such as `role="img"`) is provided.
**Action:** Always include an appropriate ARIA role (e.g. `role="img"`) when adding `aria-label` descriptions to custom visual widgets rendered with generic `div`s.

## 2026-10-24 - Range input ARIA value text formatting
**Learning:** While native HTML5 range sliders (`<input type="range">`) automatically infer numeric `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` from standard `min`, `max`, and `value` attributes, custom formatted quantities (such as percentage adjustments e.g. `+15%`) require an explicit `aria-label` and `aria-valuetext` attribute so screen readers announce the formatted string when controls are adjusted.
**Action:** Provide descriptive `aria-label` and dynamic `aria-valuetext` on range sliders that display non-standard or formatted units.
