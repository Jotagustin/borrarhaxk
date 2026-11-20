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
 *
 * La anatomía (Frente Activo / Perímetro Contenido / Área Quemada) se deriva
 * del campo `estado` en `lib/anatomy.ts`.
 */
export const FIRE_ZONES: FireZoneCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "FOCO-2026-001",
        nombre: "Cerro San Cristóbal",
        estado: "Activo",
        hectareas: 128.5,
        actualizado: "2026-11-19T08:30:00-03:00",
        inicio: "2026-11-19T06:05:00-03:00",
        comuna: "Recoleta",
        brigadas: 6,
        origen: [-33.4237, -70.6339],
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
        nombre: "Quebrada de Macul",
        estado: "Contenido",
        hectareas: 64.2,
        actualizado: "2026-11-19T07:15:00-03:00",
        inicio: "2026-11-19T04:40:00-03:00",
        comuna: "Peñalolén",
        brigadas: 4,
        origen: [-33.4916, -70.5803],
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
        nombre: "Cerro Renca",
        estado: "Controlado",
        hectareas: 31.8,
        actualizado: "2026-11-18T21:40:00-03:00",
        inicio: "2026-11-18T18:20:00-03:00",
        comuna: "Renca",
        brigadas: 3,
        origen: [-33.4013, -70.7102],
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

/* ==========================================================================
 * CAPAS TÁCTICAS — datos de ejemplo (Función táctica 3)
 * ========================================================================== */

import type { Firebreak, WaterResource } from "../types";

/** Radios de los anillos de evacuación (en metros). */
export const EVACUATION_RADII_M = [500, 1000, 2000] as const;

/**
 * Puntos de abastecimiento de agua de ejemplo alrededor del foco principal
 * (Cerro San Cristóbal). En producción vendrían de un servicio/DB.
 */
export const WATER_RESOURCES: WaterResource[] = [
  { id: "AGUA-01", nombre: "Tranque Pedro de Valdivia", tipo: "Tranque", position: [-33.4305, -70.6205], capacidadL: 450000 },
  { id: "AGUA-02", nombre: "Piscina Municipal Recoleta", tipo: "Piscina", position: [-33.4122, -70.6421], capacidadL: 80000 },
  { id: "AGUA-03", nombre: "Estanque Parque Metropolitano", tipo: "Estanque", position: [-33.4188, -70.6285], capacidadL: 250000 },
  { id: "AGUA-04", nombre: "Grifo Av. Perú", tipo: "Grifo", position: [-33.4261, -70.6450], capacidadL: 30000 },
];

/** Cortafuegos de ejemplo como líneas punteadas. */
export const FIREBREAKS: Firebreak[] = [
  {
    id: "CB-01",
    nombre: "Cortafuegos Norte",
    path: [
      [-33.4140, -70.6480],
      [-33.4160, -70.6350],
      [-33.4200, -70.6220],
    ],
    anchoM: 15,
  },
  {
    id: "CB-02",
    nombre: "Cortafuegos Este",
    path: [
      [-33.4210, -70.6210],
      [-33.4290, -70.6180],
      [-33.4360, -70.6170],
    ],
    anchoM: 12,
  },
];
