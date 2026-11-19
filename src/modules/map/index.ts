/**
 * API pública del módulo `map`.
 *
 * Regla (docs/architecture.md): otros módulos y `src/app/` deben importar
 * únicamente desde este archivo (`@/modules/map`), nunca desde rutas internas.
 */
export { default as FireMap } from "./components/FireMap";
export type { FireMapProps } from "./components/FireMap";

export { BASE_LAYERS, OVERLAY_LAYERS, INITIAL_VIEW } from "./config/layers";
export { FIRE_ZONES, DEFAULT_CENTER, DEFAULT_ZOOM } from "./data/fire-zones";

export type {
  EstadoIncendio,
  FireZoneProperties,
  FireZoneCollection,
  LatLng,
  LayerConfig,
} from "./types";
