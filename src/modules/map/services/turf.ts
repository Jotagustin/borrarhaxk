import { loadScriptOnce } from "../lib/cdn";

/**
 * Turf.js vía CDN (función táctica 2: cálculo de hectáreas).
 * https://turfjs.org — librería BSD, 100% gratuita y sin API Key.
 */
const TURF_CDN = "https://cdn.jsdelivr.net/npm/@turf/turf@7.2.0/turf.min.js";

/** Subconjunto de Turf.js que usamos (tipado mínimo). */
export interface TurfLike {
  area: (geojson: unknown) => number;
  length: (geojson: unknown, options?: { units?: string }) => number;
  polygon: (coordinates: number[][][]) => unknown;
  distance: (from: [number, number], to: [number, number], options?: { units?: string }) => number;
}

declare global {
  interface Window {
    turf?: TurfLike;
  }
}

/** Carga Turf.js (si hace falta) y devuelve su namespace global. */
export async function loadTurf(): Promise<TurfLike> {
  if (window.turf) return window.turf;
  await loadScriptOnce("turf-cdn", TURF_CDN);
  if (!window.turf) throw new Error("Turf.js no quedó disponible tras cargarlo desde el CDN.");
  return window.turf;
}

/** Hectáreas (ha) de un polígono GeoJSON. 1 ha = 10.000 m². */
export function polygonAreaHectares(turf: TurfLike, geometry: unknown): number {
  return turf.area(geometry) / 10_000;
}
