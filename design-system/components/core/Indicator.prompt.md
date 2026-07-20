The Pulse status signal: a 14px colour circle with no caption and no shape variant. Exactly four statuses. `aria-label` is always present (defaulted from status, override with `label`).

```jsx
<Indicator status="ok" />
<Indicator status="bad" label="Blocked on review" />
```

Statuses: `bad` (terracotta) · `warn` (ochre) · `ok` (sage) · `none` (grey). Never add text next to it or change its shape.
