import React from "react";

/** c-drawer — right panel over content (480px; 100% on mobile), dimmed backdrop.
    Closes on Esc and outside click. Animates transform only. Can host a
    full-height Fillout iframe via `formSrc` (rendered as data-src stub). */
export function Drawer({ open, onClose, title, eyebrow, children, footer, formSrc, width = 480 }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={"c-drawer__scrim" + (open ? " is-open" : "")} aria-hidden="true" onClick={onClose} />
      <aside className={"c-drawer" + (open ? " is-open" : "")} role="dialog" aria-modal="true" aria-label={title} style={{ width: width + "px" }}>
        <header className="c-drawer__head">
          {eyebrow && <div className="c-drawer__eyebrow">{eyebrow}</div>}
          <div className="c-drawer__title-row">
            <h2 className="c-drawer__title">{title}</h2>
            <button className="c-drawer__close" onClick={onClose} aria-label="Закрыть">✕</button>
          </div>
        </header>
        <div className="c-drawer__body">
          {children}
          {formSrc && <iframe className="c-drawer__iframe" data-src={formSrc} title="Fillout form" aria-label="Форма Fillout (v1 заглушка)" />}
        </div>
        {footer && <footer className="c-drawer__foot">{footer}</footer>}
      </aside>
    </>
  );
}
