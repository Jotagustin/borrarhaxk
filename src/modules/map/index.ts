/**
 * API pública del módulo `map`.
 *
 * Regla (docs/architecture.md): otros módulos y `src/app/` deben importar
 * únicamente desde este archivo (`@/modules/map`), nunca desde rutas internas.
 */
export { default as FireMap } from "./components/FireMap";
export type { FireMapProps } from "./components/FireMap";

export { BASE_LAYERS, OVERLAY_LAYERS, INITIAL_VIEW } from "./config/layers";
export {
  FIRE_ZONES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  EVACUATION_RADII_M,
  WATER_RESOURCES,
  FIREBREAKS,
} from "./data/fire-zones";

export { ANATOMY_LEGEND, ANATOMY_COLORS } from "./lib/anatomy";
export { evaluateRule303030, windCardinal, fireSpreadBearing } from "./services/weather";

export type {
  EstadoIncendio,
  AnatomiaIncendio,
  FireZoneProperties,
  FireZoneCollection,
  LatLng,
  LayerConfig,
  WeatherData,
  Rule303030Result,
  WaterResource,
  Firebreak,
} from "./types";
