The right-hand 480px panel (100% on mobile). Per canon its body is a **full-height Fillout iframe** — the write-path lives outside this system. Dimmed scrim, transform-only 160ms slide, closes on Esc and outside click. No native inputs inside.

```jsx
<Drawer open={open} onClose={close} eyebrow="В РАБОТЕ" title="Собрать интервью"
        formSrc="https://iamai.fillout.com/t/8RtZLWzrveus"
        footer={<><Button variant="ghost" onClick={close}>Закрыть</Button><Button variant="primary" onClick={openForm}>Открыть форму</Button></>} />
```
