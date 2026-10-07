# Dashboard design system: "Split board"

The dashboard is a Premier League forecast board. Its primary job: let a fan or
analyst scan a gameweek's forecasts in seconds, then open one match for detail.
Everything below serves that job.

## Idea

A stadium scoreboard crossed with a clean data tool. The memorable element is
the **split bar**: every forecast is one thick three-way bar (home / draw /
away) with its percentages set in condensed scoreboard numerals. It appears
identically everywhere a probability is shown. Everything around it stays
quiet: white and cool-grey surfaces, one navy ink, no decoration.

## Colour tokens

Defined once as CSS custom properties in `web/src/styles/tokens.css`.

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | `#FFFFFF` | Page and primary surface |
| `--concourse` | `#F1F3F6` | Recessed surfaces: panels, table stripes, inputs |
| `--line` | `#DCE1E8` | Dividers and control borders (use sparingly) |
| `--ink` | `#13233A` | Floodlight navy: text, primary buttons, active nav |
| `--ink-soft` | `#55657A` | Secondary text (meets 4.5:1 on paper and concourse) |
| `--home` | `#1E7A4C` | Pitch green: home-win share |
| `--draw` | `#AEB7C2` | Chalk: draw share |
| `--away` | `#2D5BD0` | Away-kit blue: away-win share |
| `--signal` | `#F2B705` | Scoreboard bulb: only the "next match" marker, always paired with the text "Next" |

Focus: every interactive element shows a 2px `--ink` outline with 2px offset
on `:focus-visible` (on navy surfaces, a 2px `--paper` outline). Amber is never
used for focus: it fails 3:1 against white.

Rules: no gradients, no shadows except the one elevation used by overlays
(dialog, search results, mobile sheet). Home/draw/away colours are never used
decoratively; they always mean an outcome, and are always paired with a number
so colour is never the only signal.

## Type

One family: **Archivo** (variable, `wdth` 62-125, `wght` 100-900), bundled via
`@fontsource-variable/archivo`. Headings and text use the normal width; only
scoreboard numerals are condensed:

| Role | Settings |
| --- | --- |
| Scores and big numbers | `wdth` 75, `wght` 800, `tabular-nums`, tight tracking |
| Headings | `wdth` 100, `wght` 700, tracking -0.02em, sentence case |
| Body and UI | `wdth` 100, `wght` 400 / 600 |
| Small data labels | `wdth` 100, `wght` 500, `--ink-soft`, sentence case |

Scale (px): 12, 14, 16, 20, 25, 31, 39, 49, and a display size of 64-88 for
hero scores. Body line length stays under 75 characters.

Never: all-caps labels, tracked-out eyebrows above headings, a single accented
word in a headline, middle-dot meta strings, arrows appended to button text,
monospace for data.

## Layout

- Content is left-aligned. Max width 1240px, 24px gutters (16px under 640px).
- Desktop shell: a slim top bar (shield mark and wordmark with the season, the
  five views as text tabs, a "Next kickoff" link to fixtures from 1260px up,
  search). No sidebar. The mark is `BrandMark`; `public/favicon.svg` uses the
  same geometry. The wordmark links home; tabs, the kickoff link and landing
  calls to action are real links (`RouteLink`), so they open in a new tab.
- Mobile shell (under 760px): top bar with brand and a search button; the five
  views in a fixed bottom tab bar within thumb reach. No horizontal scrolling.
- Surfaces are separated by spacing and `--concourse` tone, not by cards with
  borders and shadows. Radius: 6px on controls, 10px on overlays, 3px on bar
  segments. Nothing else is rounded.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64.

## The split bar

- Height 12px in lists, 20px in detail views; 2px paper gaps between segments;
  segment widths are the exact percentages.
- Numbers sit directly under their segment, left / centre / right aligned,
  in the scoreboard numerals. The favoured outcome's number is `--ink`; the
  others are `--ink-soft`.
- The accessible label always reads the three percentages in words.

## Charts

- Simple bars (goals by gameweek, feature importance, RPS strip) are plain
  HTML and CSS. Charts that need real axes (reliability curves, goal error)
  use visx, coloured from the tokens through `var(--…)`.
- Outcome colours keep their meaning in charts: `--home`, `--draw`, `--away`.
  Models read as a ramp: the production model is `--ink`, benchmarks are
  `--ink-soft` and `--draw`.
- Every chart has a text alternative (`aria-label` or a caption table) and a
  one-line note on how to read it. Diagnostic PNGs from `src/evaluate.py` use
  the same palette and are only a fallback.

## Motion

One orchestrated moment: when a gameweek loads or changes, the split bars sweep
in from zero, staggered down the list (about 400ms total). Everything else
responds only to user action:

- Active indicators (top tabs, fixture filter, selected fixture, club picker)
  glide to the new choice with one shared spring (`SPRING` in `Motion.tsx`,
  about 300ms, no overshoot) through Motion `layoutId`.
- Split bars glide to new values when they change in place (simulator).
- Swapped content (fixture detail, club profile) and route changes fade in
  with a short rise.
- Opening detail, the mobile sheet and the dialog.

All motion is disabled by `prefers-reduced-motion` and by the in-app motion
toggle, through one `MotionConfig` plus the CSS overrides in `base.css`.

## Copy

Plain, sentence case, from the fan's side. "Result pending" for a past fixture
without a recorded score. Predicted scorelines are labelled "Predicted score",
never "expected goals" (the dataset's predicted goal fields are the rounded
scoreline, not xG). Errors say what happened and what to do next.

## Implementation notes

- Styles: `tokens.css` (tokens), `base.css` (element defaults), `split-bar.css`,
  `shell.css` (top bar, tab bar, shared controls, loading/error), `pages.css`
  (the five views), `landing.css`. No legacy page CSS remains.
- Under 980px the fixture detail opens as a bottom sheet from a row tap
  (Escape, Close button or backdrop dismiss it; focus returns to the row).
- Fixtures are grouped by day when sorted by kickoff. Dark scores are final,
  grey scores are predicted.
- Analytics shows the RPS comparison on a zoomed axis and says so on the page.
- The footer toggle is labelled "Reduce motion" and uses `aria-pressed`.
