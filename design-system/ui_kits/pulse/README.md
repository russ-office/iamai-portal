# Pulse UI kit

Interactive click-through of the three MateOS / Pulse page archetypes named in the
source: **overview**, **list** (People), and **person**. Composes the `core`
components — it does not re-implement primitives.

- `index.html` — mounts the app (fixed left rail + top bar; content switches).
- `Shell.jsx` — chrome: left rail, top bar, search, primary action.
- `Overview.jsx` — sprint overview archetype (stat cards, team pulse list, activity).
- `List.jsx` — People list archetype (dense DataRow table, row → person).
- `Person.jsx` — person archetype (header, 14-day activity, detail cards, Edit drawer).
- `App.jsx` — nav + drawer state, wires the three screens together.

Interaction: click a nav item or a person row to navigate; **Add note** / **Edit**
open the 480px right drawer with an embedded form.
