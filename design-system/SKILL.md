---
name: mateos-pulse-design
description: Use this skill to generate well-branded interfaces and assets for MateOS / Pulse, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files
(`styles.css` + `tokens/` for foundations, `components/core/` for primitives and their
`.prompt.md` usage notes, `ui_kits/pulse/` for full-screen recreations, `guidelines/`
for specimen cards).

MateOS / Pulse is a quiet, dense, paper-like internal instrument — not a marketing
surface. Restraint over decoration. Key rules: palette W2 "Linen" only (warm paper,
one terracotta accent used sparingly); one elevation level (D1 "Edge"); Manrope text,
JetBrains Mono for labels/codes/numbers, Lora italic at most once per page; the 14px
colour-only status indicator with a mandatory `aria-label`.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets
out and create static HTML files for the user to view. If working on production code,
you can copy assets and read the rules here to become an expert in designing with this
brand.

If the user invokes this skill without any other guidance, ask them what they want to
build or design, ask some questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.
