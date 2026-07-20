# MateOS / Pulse — Design System

MateOS is an internal instrument for tracking team pulse and sprint progress.
**Pulse** is its primary product surface. This is not a marketing site: it is an
everyday working tool for managers and practitioners. The interface is dense,
quiet, and paper-like — an instrument, not a dashboard.

## Sources

- **`design-system-source/`** — read-only codebase mounted via File System Access.
  - `design-system-source/tokens.css` — authoritative palette, type and elevation source.
  - `design-system-source/README.md` — the canonical brand rules (reproduced below).

No logo, brand mark, product screenshots, slide templates, or font binaries were
provided. Consequences:
- **No logo exists.** The brand name is rendered in plain type (Manrope, tight
  tracking) wherever a mark would go. Do not invent a logo.
- **Fonts are loaded from Google Fonts** (Manrope, JetBrains Mono, Lora) — the exact
  families named in the source. Replace with licensed local binaries if the brand
  ships its own. See `tokens/fonts.css`. *(SUBSTITUTION — flagged for the user.)*

## The canonical rules (from source README)

- **Palette W2 "Linen" only.** Warm paper base, single terracotta accent used
  sparingly: primary action, active state, `bad` status. Never as a large fill.
- **One elevation level: D1 "Edge".** 1px border, white top edge, 4px radius,
  barely-there shadow. There is no second level. Neumorphism is banned.
- **Type:** Manrope for text, JetBrains Mono for labels/codes/numbers, Lora italic
  no more than once per page.
- **Status indicator:** 14px circle, 4 colours, no captions, no shape differences.
  `aria-label` mandatory on every instance.
- **Activity feed:** 14-day window, 1px vertical tick plus a dot. Not bars.
- **Page archetypes:** three only — person, list, overview.
- **Drawer:** right-hand panel, 480px, holds an embedded form.
- **Feel:** quiet, dense, paper-like. Restraint over decoration. Calm over contrast.

---

## CONTENT FUNDAMENTALS

The voice is that of a quiet instrument reporting facts — no cheerleading, no
marketing gloss.

- **Tone:** factual, terse, calm. State the reading; don't editorialise it. Never
  "Great job! 🎉" — instead just `On track` or a status dot.
- **Person:** neutral third-person and imperative. Labels address the object, not
  the user ("Assignee", "Last active", "Add note"), not "your team" / "you've got".
- **Casing:** Sentence case for prose and headings. **UPPERCASE mono** for micro
  labels, codes, and eyebrows (`SPRINT 24 · DAY 6`, `ASSIGNEE`). Never title-case
  headings.
- **Numbers & codes** always set in JetBrains Mono with tabular figures
  (`PR-4821`, `62%`, `14d`). Dates are compact (`Jul 20`, `6d ago`).
- **Emoji:** never. Status is a colour dot with an `aria-label`, never an emoji.
- **Lora italic** appears at most once per page — reserved for a single human aside
  or editorial note (e.g. an overview summary line). It is a seasoning, not a style.
- **Examples:**
  - Eyebrow: `SPRINT 24 · DAY 6 OF 10`
  - Status label (aria only): `aria-label="At risk"`
  - Meta row: `Last active 6d ago · 4 open · PR-4821`
  - Editorial note (Lora italic, once): *"Velocity dipped after the release freeze."*

## VISUAL FOUNDATIONS

- **Colour:** warm paper (`#F7F4ED`) app background; a slightly lighter warm white
  (`#FCFAF5`) for raised surfaces. Ink is warm near-black (`#1C1A17`), never pure
  black. A single terracotta accent (`#D9542F`) carries primary action, active
  state, and the `bad` status — used *sparingly*, never as a large fill. No
  gradients anywhere. Two background colours maximum (paper + surface).
- **Type:** Manrope for everything readable; JetBrains Mono for labels, codes,
  numbers (tabular, +0.06em tracking, uppercase for micro labels); Lora italic once
  per page. Dense scale: body 13–14px, micro mono 11px, headings top out at 28px.
- **Backgrounds:** flat paper. No images, no full-bleed photography, no repeating
  textures, no gradients. The warmth of the two paper tones *is* the texture.
- **Elevation — one level only (D1 "Edge"):** `background:#FCFAF5; border:1px solid
  #E3DED2; border-top:1px solid #fff; border-radius:4px; box-shadow:0 1px 2px
  rgba(120,105,85,.10)`. The white top border is the whole trick — it reads as a
  lit paper edge. Never stack shadows, never go darker/bigger. No second level.
- **Borders:** 1px hairlines in `--line` (`#E3DED2`) do most of the structural work —
  separating rows, framing cards, dividing panels. Structure comes from lines, not
  shadow.
- **Corner radii:** 4px on cards/inputs/buttons; 3px on tiny chips; full pill only
  for the status/indicator circles. Nothing more rounded than 4px on rectangles.
- **Animation:** minimal and quick. 120–160ms ease for hover/press and drawer
  slide-in. No bounces, no springs, no attention-seeking motion. Fades over moves.
- **Hover:** buttons darken slightly (accent → `#C24A29`; ghost → faint paper
  tint); rows get a 1px paper-tint background. Never lift or grow on hover.
- **Press:** colour deepens; optional 1px translate-down. No scale-down bounce.
- **Transparency / blur:** essentially none. The drawer scrim is a low-opacity ink
  wash (`rgba(28,26,23,.18)`), no backdrop blur.
- **Layout:** dense grid, generous but not airy. Fixed left rail + top bar; content
  scrolls; drawer is a fixed 480px right panel. 4px spacing grid, 24px gutters,
  32px page padding.
- **Imagery vibe:** none by default; if avatars appear they are monogram chips in
  `--deep`, not photos.

## ICONOGRAPHY

The source specifies no icon set and ships no glyphs. The brand's needs are a small
set of thin-stroke line icons matching the quiet paper aesthetic.

- **Set:** [Lucide](https://lucide.dev) linked from CDN — 1.5–2px stroke, rounded
  joins, no fill. *(SUBSTITUTION — flagged: no icon assets were provided; Lucide is
  the closest thin-line match. Swap for the brand's own set when available.)*
- **Sizing:** 16px in dense rows/buttons, 18–20px in headers. `stroke:currentColor`
  so icons inherit ink; never coloured except the rare accent action icon.
- **Status is never an icon** — it is the 14px colour dot only.
- **Emoji / unicode as icons:** never used.

---

## INDEX / MANIFEST

Root
- `styles.css` — the single entry point consumers link; `@import`s only.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `elevation.css`,
  `fonts.css`, `base.css`.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skills-compatible entry.

Components (`components/core/`) — the canonical set, one file per component.
- `Button` (`c-btn`) — action primitive (primary / secondary / ghost).
- `Card` (`c-sheet`) — the single D1 surface.
- `Indicator` (`c-status-dot`) — 14px status dot, four states (aria-label required).
- `Badge` (`c-chip`) — mono status/count chip.
- `DataRow` (`c-task-row`) — one dense task/list row.
- `ActivityFeed` (`c-tape`) — 14-day tick+dot activity feed.
- `Drawer` (`c-drawer`) — 480px right panel; body is a full-height Fillout iframe.
- `Avatar` (`c-avatar`) — monogram chip.
- `Metric` (`c-metric`), `KpiTile` (`c-kpi-tile`) — labelled numbers.
- `StageBar` (`c-stage-bar`) — thread/pipeline progress.
- `Triad` (`c-triad`) — Problem / Output / Input columns.
- `RankRow` (`c-rank-row`) — leaderboard row.
- `Empty` (`c-empty`) — empty state.

## CANONICAL COMPONENT INVENTORY (20, closed list)

The authoritative class names live in `components/components.css` and are shipped
to consumers via `styles.css`. Every one sits on the single D1 elevation. Do not
add components beyond this list — if something seems missing, note it here rather
than inventing it. Full states/tokens/a11y specimens: `ui_kits/pulse/gallery.html`.

1. `c-shell` — app frame: fixed rail + scrolling main.
2. `c-nav` — data-driven vertical nav (items arrive as an array).
3. `c-nav-item` — `+is-active` (accent rail), `+is-soon` (muted mono chip, `cursor:default`, not a link).
4. `c-page-head` — top bar: mono eyebrow + title + optional action.
5. `c-sheet` — THE D1 "Edge" surface. The only elevation.
6. `c-status-dot` — 14px circle, four colours (ok/warn/bad/none), colour only, no caption/shape/ring. `aria-label` mandatory. `none` ≠ `bad`.
7. `c-metric` — a labelled number (mono, tabular).
8. `c-kpi-tile` — a sheet-wrapped metric; sizes to the row, not the number.
9. `c-stage-bar` — thread/pipeline progress; terracotta in progress, `is-complete` = sage.
10. `c-triad` — Problem / Output / Input, three hairline-headed columns, no nested cards.
11. `c-tape` — activity feed, exactly 14 days: 1px tick (height=activity) + dot; empty day = tick in line colour; today = dashed guide; mono edge labels. Not a bar chart.
12. `c-drawer` — right panel over content, 480px (100% mobile), dimmed scrim, Esc + outside-click close, full-height Fillout iframe (`data-src`), transform-only animation.
13. `c-table` — data table on a sheet; numbers right, tabular, mono.
14. `c-rank-row` — leaderboard row: position · avatar · name · dot · numbers.
15. `c-filter-bar` — row of selects/chips above a list/table; mono count pinned right.
16. `c-chip` — mono chip; `+is-accent`, `+is-quiet`.
17. `c-btn` — `is-primary` (terracotta) / `is-secondary` / `is-ghost`.
18. `c-avatar` — monogram chip on the deep surface. No photos.
19. `c-task-row` — status dot · title/artifact · chip · due.
20. `c-empty` — empty state for any list/table/feed. One muted mono line, never an illustration.

**Deliberate overlap:** `bad` status and the primary accent are the same terracotta
(`#D9542F`) — one signal colour for the whole system, by design. **Every number**
across the kit is `tabular-nums` and set in JetBrains Mono.

**Implementation coverage (20 canonical classes = the whole shipped set).**
All 20 exist as classes in `components/components.css` and appear in the gallery.
- **14 are backed by a React primitive:** `c-sheet`=Card, `c-status-dot`=Indicator,
  `c-metric`=Metric, `c-kpi-tile`=KpiTile, `c-stage-bar`=StageBar, `c-triad`=Triad,
  `c-tape`=ActivityFeed, `c-drawer`=Drawer, `c-rank-row`=RankRow, `c-chip`=Badge,
  `c-btn`=Button, `c-avatar`=Avatar, `c-task-row`=DataRow, `c-empty`=Empty.
- **6 are CSS-only layout/structural classes with no React primitive** (by design):
  `c-shell`, `c-nav`, `c-nav-item`, `c-page-head`, `c-table`, `c-filter-bar`. Use the
  class on plain markup; the `c-filter-bar` holds native `<select>` controls (there
  is no canonical select component).
- Nothing else ships. Earlier form/toolbar helpers (Field, TextInput, Select,
  IconButton) were removed — they were not part of the canonical 20 and the drawer is
  iframe-only, so they were unused.
- **`c-table` sorting is view-level**, not baked into the class: the class styles the
  table; sortable column headers (click to toggle, `aria-sort`) are wired in the view
  that renders it (see the Calendar view in `ui_kits/pulse/App.jsx`). Бэклог
  (`page-list`) is card-based per the spec («карточки»), so it has no column headers.

**Mock-data guard.** `ui_kits/pulse/data.js` carries `__mock: true` marking the two
arrays absent from the real snapshot — `leaderboard[]` and `metrics.activity_14d`.
Delete either and its view degrades to `c-empty` (Leaderboard list; person Activity
tape), never a broken render. The gallery shows both populated and empty states for
`c-tape` and `c-rank-row`.

Foundation cards — `guidelines/*.card.html` (Type, Colors, Spacing, Brand groups).

UI kit — `ui_kits/pulse/` — the three page archetypes (person, list/Бэклог,
overview/Спринт) plus Calendar, Leaderboard and History views, as an interactive
click-through built against the real spec (`spec_pulse_person_v1_for_opus.md`) and
data snapshot (`mock_snapshot_pulse_person.json`). `gallery.html` shows all 20
canonical components.
