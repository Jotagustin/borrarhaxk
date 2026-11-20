import type { FeatureCollection, Polygon } from "geojson";

/** Estado operativo / anatomía de un incendio forestal. */
export type EstadoIncendio = "Activo" | "Contenido" | "Controlado" | "Extinguido";

/** Etiqueta legible de la anatomía del incendio (para leyenda y popups). */
export type AnatomiaIncendio =
  | "Frente Activo"
  | "Perímetro Contenido"
  | "Área Quemada / Extinguida";

/** Propiedades asociadas a cada "Zona de Incendio Activa". */
export interface FireZoneProperties {
  /** Identificador único del foco. */
  id: string;
  /** Nombre del sector afectado (ej: "Incendio Cerro Renca"). */
  nombre: string;
  /** Estado operativo actual. */
  estado: EstadoIncendio;
  /** Superficie reportada en hectáreas (referencial). */
  hectareas: number;
  /** Fecha/hora del último reporte (ISO 8601). */
  actualizado: string;
  /** Fecha/hora de inicio del incendio (ISO 8601). */
  inicio: string;
  /** Comuna o localidad donde ocurre el foco. */
  comuna: string;
  /** Número de brigadas desplegadas. */
  brigadas: number;
  /** Punto de origen [lat, lng] donde nació el fuego. */
  origen: LatLng;
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

/* ==========================================================================
 * CLIMA (Open-Meteo) — Función táctica 1
 * ========================================================================== */

/** Instantánea del clima en el foco del incendio. */
export interface WeatherData {
  /** Temperatura a 2 m (°C). */
  temperature: number;
  /** Humedad relativa (%). */
  humidity: number;
  /** Velocidad del viento a 10 m (km/h). */
  windSpeed: number;
  /** Dirección del viento (grados, 0-360, de donde VIENE el viento). */
  windDirection: number;
  /** Momento de la consulta (ISO 8601). */
  fetchedAt: string;
  /** Zona horaria devuelta por la API. */
  timezone: string;
}

/** Evaluación de la "Regla 30-30-30". */
export interface Rule303030Result {
  /** true si se cumplen las tres condiciones simultáneamente. */
  active: boolean;
  /** Detalle por condición, para mostrar en el HUD. */
  checks: {
    temperature: boolean;
    humidity: boolean;
    wind: boolean;
  };
}

/* ==========================================================================
 * CAPAS TÁCTICAS — Función táctica 3
 * ========================================================================== */

/** Punto de abastecimiento de agua (tranque, piscina, grifo…). */
export interface WaterResource {
  id: string;
  nombre: string;
  tipo: "Tranque" | "Piscina" | "Estanque" | "Grifo";
  /** Coordenadas [lat, lng]. */
  position: LatLng;
  /** Capacidad estimada en litros (referencial). */
  capacidadL: number;
}

/** Cortafuegos trazado como línea [ [lat,lng], ... ]. */
export interface Firebreak {
  id: string;
  nombre: string;
  /** Vértices del cortafuegos. */
  path: LatLng[];
  /** Ancho aproximado en metros (informativo). */
  anchoM: number;
}
