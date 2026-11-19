import type { LayerConfig } from "../types";

/** Atribución oficial de Esri World Imagery (tiles satelitales gratuitos). */
export const ESRI_IMAGERY_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

/** Atribución de OpenStreetMap / OpenTopoMap. */
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)';

/** Atribución de CartoDB Positron. */
export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/**
 * Capas base. El usuario alterna entre ellas con `L.control.layers`:
 * - Satelital (Esri World Imagery): imagen real del terreno.
 * - Topográfica (OpenTopoMap): relieve + curvas de nivel.
 */
export const BASE_LAYERS: LayerConfig[] = [
  {
    id: "satelite",
    name: "Satelital (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_IMAGERY_ATTRIBUTION,
    maxZoom: 19,
  },
  {
    id: "topografico",
    name: "Topográfico (OpenTopoMap)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: OSM_ATTRIBUTION,
    maxZoom: 17,
    subdomains: ["a", "b", "c"],
  },
];

/**
 * Capas superpuestas (overlays) transparentes con nombres de calles y
 * localidades, para no perder la orientación geográfica sobre el satélite.
 */
export const OVERLAY_LAYERS: LayerConfig[] = [
  {
    id: "etiquetasReferencia",
    name: "Nombres y límites (Esri Reference)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_IMAGERY_ATTRIBUTION,
    maxZoom: 19,
  },
  {
    id: "etiquetasCarto",
    name: "Solo etiquetas (CartoDB Positron)",
    url: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
    attribution: CARTO_ATTRIBUTION,
    maxZoom: 20,
    subdomains: ["a", "b", "c", "d"],
  },
];

/** Vista inicial del mapa. */
export const INITIAL_VIEW = {
  center: [-33.4489, -70.6693] as [number, number],
  zoom: 13,
};

/** Zoom hasta el cual se muestran las capas base y overlays. */
export const OPACITY_OVERLAY = 0.85;
