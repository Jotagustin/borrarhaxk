import L from "leaflet";
import type { LayerConfig } from "../types";
import { ESRI_IMAGERY_ATTRIBUTION, OVERLAY_LAYERS, BASE_LAYERS } from "../config/layers";

/**
 * Crea una capa de tiles de Leaflet a partir de una definición declarativa.
 * Centraliza la configuración (URL, atribución, subdominios, zoom) para que
 * el componente de mapa no conozca los detalles de cada proveedor.
 */
export function createTileLayer(config: LayerConfig): L.TileLayer {
  return L.tileLayer(config.url, {
    attribution: config.attribution,
    maxZoom: config.maxZoom ?? 19,
    minZoom: config.minZoom ?? 0,
    subdomains: config.subdomains ?? "abc",
    crossOrigin: true,
    // `r` solo se usa en plantillas de CARTO; Leaflet ignora parámetros sobrantes.
    detectRetina: true,
  });
}

/** Crea la capa base satelital de Esri World Imagery. */
export function createSatelliteLayer(): L.TileLayer {
  const config = BASE_LAYERS.find((layer) => layer.id === "satelite");
  if (!config) throw new Error("No se encontró la configuración de la capa satelital.");
  return createTileLayer(config);
}

/** Crea el overlay transparente de etiquetas/nombres de Esri Reference. */
export function createReferenceLabelsLayer(): L.TileLayer {
  const config = OVERLAY_LAYERS.find((layer) => layer.id === "etiquetasReferencia");
  if (!config) throw new Error("No se encontró la configuración del overlay de etiquetas.");
  return createTileLayer(config);
}

export { ESRI_IMAGERY_ATTRIBUTION };
