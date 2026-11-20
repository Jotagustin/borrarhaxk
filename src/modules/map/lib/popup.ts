import type { FireZoneProperties } from "../types";
import { ANATOMY_COLORS, anatomyFromEstado } from "./anatomy";

/** Formatea una fecha ISO a un texto legible en español (es-CL). */
export function formatFecha(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

/** Formatea solo hora:minutos (para "hora del último reporte"). */
export function formatHora(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/** Escape básico de HTML para textos provenientes de datos. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
  );
}

/**
 * Construye el HTML del popup detallado de una "Zona de Incendio".
 *
 * @param props Propiedades del foco.
 * @param hectaresOverrides Hectáreas calculadas con Turf.js (opcional), que
 *        sustituyen la superficie reportada.
 */
export function buildFireZonePopup(
  props: FireZoneProperties,
  hectaresOverrides?: number,
): string {
  const anatomia = anatomyFromEstado(props.estado);
  const color = ANATOMY_COLORS[anatomia];
  const hectareas = hectaresOverrides ?? props.hectareas;
  const nombreCalc = hectaresOverrides !== undefined;

  return `
    <div class="fire-popup">
      <span class="fire-popup__badge" style="background:${color}">${escapeHtml(anatomia)}</span>
      <h3 class="fire-popup__title">${escapeHtml(props.nombre)}</h3>
      <dl class="fire-popup__list">
        <dt>Sector / comuna</dt>
        <dd>${escapeHtml(props.comuna)}</dd>
        <dt>Estado</dt>
        <dd>${escapeHtml(props.estado)}</dd>
        <dt>Hectáreas afectadas</dt>
        <dd>${hectareas.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ha${
          nombreCalc ? ' <span class="fire-popup__calc">· Turf.js</span>' : ""
        }</dd>
        <dt>Brigadas</dt>
        <dd>${props.brigadas}</dd>
        <dt>Inicio</dt>
        <dd>${escapeHtml(formatFecha(props.inicio))}</dd>
        <dt>Último reporte</dt>
        <dd>${escapeHtml(formatHora(props.actualizado))}</dd>
      </dl>
    </div>
  `;
}

export { anatomyFromEstado };
