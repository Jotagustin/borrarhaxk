import type L from "leaflet";
import type { AnatomiaIncendio, EstadoIncendio } from "../types";

/**
 * Mapea el estado operativo a la "anatomía" táctica del incendio.
 * - Activo      → Frente Activo (avanza)
 * - Contenido   → Perímetro Contenido (detenido pero inestable)
 * - Controlado / Extinguido → Área Quemada / Extinguida
 */
export function anatomyFromEstado(estado: EstadoIncendio): AnatomiaIncendio {
  switch (estado) {
    case "Activo":
      return "Frente Activo";
    case "Contenido":
      return "Perímetro Contenido";
    default:
      return "Área Quemada / Extinguida";
  }
}

/** Estilos visuales por anatomía (borde + relleno). */
export const ANATOMY_STYLES: Record<AnatomiaIncendio, L.PathOptions> = {
  // Borde rojo intenso + relleno rojo semitransparente.
  "Frente Activo": {
    color: "#b91c1c",
    weight: 3,
    opacity: 1,
    fillColor: "#ef4444",
    fillOpacity: 0.4,
  },
  // Borde naranja + relleno amarillo/naranja.
  "Perímetro Contenido": {
    color: "#ea580c",
    weight: 3,
    opacity: 1,
    fillColor: "#f59e0b",
    fillOpacity: 0.38,
  },
  // Borde gris + relleno oscuro.
  "Área Quemada / Extinguida": {
    color: "#4b5563",
    weight: 2,
    opacity: 0.95,
    fillColor: "#1f2937",
    fillOpacity: 0.55,
  },
};

/** Color de acento por anatomía (para badges y leyenda). */
export const ANATOMY_COLORS: Record<AnatomiaIncendio, string> = {
  "Frente Activo": "#dc2626",
  "Perímetro Contenido": "#ea580c",
  "Área Quemada / Extinguida": "#4b5563",
};

/** Definición de la leyenda de anatomía para renderizar en la UI. */
export const ANATOMY_LEGEND: Array<{
  label: AnatomiaIncendio;
  border: string;
  fill: string;
}> = [
  { label: "Frente Activo", border: "#b91c1c", fill: "rgba(239,68,68,0.4)" },
  { label: "Perímetro Contenido", border: "#ea580c", fill: "rgba(245,158,11,0.38)" },
  { label: "Área Quemada / Extinguida", border: "#4b5563", fill: "rgba(31,41,55,0.55)" },
];
