import type { FeatureCollection, Polygon } from "geojson";

/** Estado operativo de un foco de incendio. */
export type EstadoIncendio = "Activo" | "Contenido" | "Controlado" | "Extinguido";

/** Propiedades asociadas a cada "Zona de Incendio Activa". */
export interface FireZoneProperties {
  /** Identificador único del foco. */
  id: string;
  /** Nombre descriptivo del foco (ej: "Incendio Cerro Renca"). */
  nombre: string;
  /** Estado operativo actual. */
  estado: EstadoIncendio;
  /** Superficie afectada en hectáreas. */
  hectareas: number;
  /** Fecha de última actualización (ISO 8601). */
  actualizado: string;
  /** Comuna o localidad donde ocurre el foco. */
  comuna: string;
  /** Número de brigadas desplegadas. */
  brigadas: number;
}

/** Colección GeoJSON tipada con las zonas de incendio. */
export type FireZoneCollection = FeatureCollection<Polygon, FireZoneProperties>;

/** Coordenadas geográficas [latitud, longitud]. */
export type LatLng = [number, number];

/** Definición declarativa de una capa de tiles de Leaflet. */
export interface LayerConfig {
  /** Identificador estable de la capa. */
  id: string;
  /** Nombre visible en el control de capas. */
  name: string;
  /** Plantilla de URL de los tiles. */
  url: string;
  /** Texto de atribución obligatorio. */
  attribution: string;
  /** Zoom máximo soportado por la fuente. */
  maxZoom?: number;
  /** Zoom mínimo soportado por la fuente. */
  minZoom?: number;
  /** Subdominios disponibles en la plantilla de URL. */
  subdomains?: string[];
}
