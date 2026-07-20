One action trigger. Use `primary` (terracotta) for the single most important action in a view; `secondary` for neutral actions; `ghost` for low-emphasis inline actions.

```jsx
<Button variant="primary" onClick={save}>Add note</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost">Dismiss</Button>
```

Variants: `primary | secondary | ghost`. Sizes: `sm | md | lg`. Never place two primary buttons together — the terracotta fill must stay rare.
