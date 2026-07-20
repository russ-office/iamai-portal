# MateOS / Pulse — design system source

Canonical source for the "Pulse" product surface. `tokens.css` is authoritative.

## Rules

- **Palette W2 "Linen" only.** Warm paper base, single terracotta accent.
  Accent is used sparingly: primary action, active state, `bad` status. Never as a fill.
- **One elevation level: D1 "Edge".** 1px border, white top edge, 4px radius,
  barely-there shadow. There is no second level. Neumorphism is banned.
- **Type:** Manrope for text, JetBrains Mono for labels, codes and numbers,
  Lora italic no more than once per page.
- **Status indicator:** 14px circle, 4 colours, no captions, no shape differences.
  `aria-label` mandatory on every instance.
- **Activity feed:** 14-day window, 1px vertical tick plus a dot. Not bars.
- **Page archetypes:** three only — person, list, overview.
- **Drawer:** right-hand panel, 480px, holds an embedded form.

## Feel

Quiet, dense, paper-like. An instrument, not a dashboard.
Restraint over decoration. Calm over contrast.
