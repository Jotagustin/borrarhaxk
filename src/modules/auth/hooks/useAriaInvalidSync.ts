"use client";

import { useEffect } from "react";

/** Lista el mensaje de error (id en data-error) en aria-describedby solo mientras se muestra. */
function linkError(el: HTMLElement, shown: boolean) {
  const errorId = el.dataset.error;
  if (!errorId) return;
  const input = el as HTMLInputElement;
  const ids = (input.getAttribute("aria-describedby") || "")
    .split(/\s+/)
    .filter((id) => id && id !== errorId);
  if (shown) ids.push(errorId);
  if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
  else input.removeAttribute("aria-describedby");
}

/**
 * Sincroniza aria-invalid con el estado visual :user-invalid.
 * Se monta una vez en el layout de auth; cubre ambos formularios.
 */
export function useAriaInvalidSync() {
  useEffect(() => {
    const flagged = new WeakSet<HTMLElement>();

    const syncAria = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return;
      if (!el.matches("input, select, textarea")) return;
      const invalid = el.matches(":user-invalid");
      if (invalid) {
        el.setAttribute("aria-invalid", "true");
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute("aria-invalid") !== "true") {
        el.setAttribute("aria-invalid", "false");
        linkError(el, false);
        flagged.delete(el);
      }
    };

    document.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.setAttribute("aria-invalid", "false");
      }
    });

    const onBlur = (e: FocusEvent) => syncAria(e.target);
    const onInput = (e: Event) => syncAria(e.target);
    const onInvalid = (e: Event) => syncAria(e.target);

    document.addEventListener("blur", onBlur, true);
    document.addEventListener("input", onInput);
    document.addEventListener("invalid", onInvalid, true);

    return () => {
      document.removeEventListener("blur", onBlur, true);
      document.removeEventListener("input", onInput);
      document.removeEventListener("invalid", onInvalid, true);
    };
  }, []);
}
