import L from "leaflet";
import type { FireZoneCollection, FireZoneProperties } from "../types";
import { buildFireZonePopup } from "../lib/popup";

/** Estilo base de las zonas de incendio: rojo semitransparente. */
export const FIRE_ZONE_STYLE: L.PathOptions = {
  color: "#b91c1c",
  weight: 2,
  opacity: 0.9,
  fillColor: "#ef4444",
  fillOpacity: 0.35,
};

/** Estilo aplicado al pasar el cursor sobre una zona. */
export const FIRE_ZONE_HOVER_STYLE: L.PathOptions = {
  weight: 3,
  fillOpacity: 0.5,
};

/**
 * Convierte una colección GeoJSON de incendios en una capa de Leaflet con
 * popups informativos y realce al pasar el cursor.
 *
 * Usa `L.geoJSON` (estándar GIS) en lugar de `L.polygon` manual, para que la
 * fuente de datos pueda reemplazarse por un servicio real sin cambiar la UI.
 */
export function createFireZonesLayer(
  data: FireZoneCollection,
  onSelect?: (props: FireZoneProperties) => void,
): L.GeoJSON {
  return L.geoJSON(data, {
    style: () => ({ ...FIRE_ZONE_STYLE }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties as FireZoneProperties;
      if (!props) return;

      layer.bindPopup(buildFireZonePopup(props), {
        maxWidth: 320,
        className: "fire-popup__container",
      });

      layer.on({
        mouseover: (event) => {
          const target = event.target as L.Path;
          target.setStyle(FIRE_ZONE_HOVER_STYLE);
          target.bringToFront();
        },
        mouseout: (event) => {
          const target = event.target as L.Path;
          target.setStyle(FIRE_ZONE_STYLE);
        },
        click: () => onSelect?.(props),
      });
    },
  });
}
