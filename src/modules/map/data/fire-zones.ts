import type { FireZoneCollection, LatLng } from "../types";

/** Centro por defecto del mapa: Santiago, Chile. */
export const DEFAULT_CENTER: LatLng = [-33.4489, -70.6693];

/** Zoom inicial del mapa. */
export const DEFAULT_ZOOM = 13;

/**
 * Datos de ejemplo: "Zonas de Incendio Activa".
 *
 * IMPORTANTE (GeoJSON): las coordenadas van en orden [longitud, latitud],
 * al revés que en Leaflet ([latitud, longitud]).
 */
export const FIRE_ZONES: FireZoneCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "FOCO-2026-001",
        nombre: "Incendio Cerro San Cristóbal",
        estado: "Activo",
        hectareas: 128.5,
        actualizado: "2026-11-19T08:30:00-03:00",
        comuna: "Recoleta",
        brigadas: 6,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-70.6405, -33.4175],
            [-70.628, -33.4165],
            [-70.6255, -33.4275],
            [-70.638, -33.4305],
            [-70.6405, -33.4175],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "FOCO-2026-002",
        nombre: "Incendio Quebrada de Macul",
        estado: "Contenido",
        hectareas: 64.2,
        actualizado: "2026-11-19T07:15:00-03:00",
        comuna: "Peñalolén",
        brigadas: 4,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-70.5905, -33.4852],
            [-70.5732, -33.4841],
            [-70.5701, -33.4972],
            [-70.5881, -33.4991],
            [-70.5905, -33.4852],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "FOCO-2026-003",
        nombre: "Incendio Cerro Renca",
        estado: "Controlado",
        hectareas: 31.8,
        actualizado: "2026-11-18T21:40:00-03:00",
        comuna: "Renca",
        brigadas: 3,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-70.7205, -33.3952],
            [-70.7021, -33.3931],
            [-70.7002, -33.4073],
            [-70.7182, -33.4091],
            [-70.7205, -33.3952],
          ],
        ],
      },
    },
  ],
};
