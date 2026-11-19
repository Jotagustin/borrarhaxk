import type { EstadoIncendio, FireZoneProperties } from "../types";

/** Color del marcador/acento según el estado del foco. */
const ESTADO_COLOR: Record<EstadoIncendio, string> = {
  Activo: "#dc2626",
  Contenido: "#ea580c",
  Controlado: "#ca8a04",
  Extinguido: "#16a34a",
};

/** Formatea una fecha ISO a un texto legible en español (es-CL). */
function formatFecha(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

/**
 * Construye el HTML del popup informativo de una "Zona de Incendio Activa".
 * Se sanitiza el texto para evitar inyección de HTML.
 */
export function buildFireZonePopup(props: FireZoneProperties): string {
  const color = ESTADO_COLOR[props.estado] ?? "#dc2626";
  const escape = (value: string): string =>
    value.replace(/[&<>"']/g, (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char,
    );

  return `
    <div class="fire-popup">
      <span class="fire-popup__badge" style="background:${color}">${escape(props.estado)}</span>
      <h3 class="fire-popup__title">${escape(props.nombre)}</h3>
      <dl class="fire-popup__list">
        <dt>Comuna</dt>
        <dd>${escape(props.comuna)}</dd>
        <dt>Hectáreas afectadas</dt>
        <dd>${props.hectareas.toLocaleString("es-CL")} ha</dd>
        <dt>Brigadas desplegadas</dt>
        <dd>${props.brigadas}</dd>
        <dt>Última actualización</dt>
        <dd>${escape(formatFecha(props.actualizado))}</dd>
      </dl>
    </div>
  `;
}

export { ESTADO_COLOR };
